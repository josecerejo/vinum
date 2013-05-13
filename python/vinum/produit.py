from vinum import *
from common import *
from appy.pod.renderer import Renderer


@app.route('/produit/get', methods=['GET'])
@login_required
def get_produit():
    if 'no_client' in request.args:
        return get(g, request, {'produit': 'p', 'client_produit': 'cp'},
                   join={'p.no_produit_interne': 'cp.no_produit_interne'},
                   where={'no_client': request.args['no_client']})
    else:
        return get(g, request, {'produit':'p','producteur':'r'},
                   join={'p.no_producteur': 'r.no_producteur'},
                   what=['p.*', 'r.nom_producteur'],
                   query_fields=('type_vin', 'nom_domaine'),
                   field_map={'no_producteur': 'p.no_producteur'})


def _get_prix_data(request):
    cur = g.db.cursor()
    qvals = []
    ptc = 'i.prix_%s as prix' % request['type_client']
    q = """select * from (
                -- actif/en reserve/en attente
                select p.*, i.*, r.nom_producteur, %s
                     from produit p, inventaire i, producteur r where p.no_producteur = r.no_producteur and
                                i.no_inventaire = (select no_inventaire from inventaire i
                                                   where i.no_produit_interne = p.no_produit_interne and statut_inventaire != 'inactif'
                                                   order by date_commande limit 1)
                union
                -- inactif records
                select p.*, i.*, r.nom_producteur, %s
                         from produit p, inventaire i, producteur r where p.no_producteur = r.no_producteur and
                                i.no_inventaire = (select no_inventaire from inventaire i
                                                   where i.no_produit_interne = p.no_produit_interne
                                                   order by date_commande desc limit 1)
                                and not exists (select 1 from inventaire i
                                                where i.no_produit_interne = p.no_produit_interne and
                                                statut_inventaire != 'inactif')
            ) _ where true """ % (ptc, ptc)
    if request.get('filter', '').strip():
        for filter_arg in json.loads(request['filter']):
            if filter_arg['type'] == 'string':
                q += " and unaccent(%s) ilike unaccent(%%s) " % filter_arg['field']
                qvals.append('%%%s%%' % filter_arg['value'])
            else:
                comp_op_map = {'lt':'<', 'gt':'>', 'le':'<=', 'ge':'>=', 'eq':'='}
                q += ' and %s %s %%s ' % (filter_arg['field'], comp_op_map[filter_arg.get('comparison', 'eq')])
                qvals.append(filter_arg['value'])
    if 'sort' in request:
        sort_args = json.loads(request['sort'])
        q += ('order by ' + ','.join(['%s %s' % (sa['property'], sa['direction']) for sa in sort_args]))
    else:
        q += "order by type_vin"
    cur.execute(q, qvals)
    return cur.fetchall()


@app.route('/produit/get_prix', methods=['GET'])
@login_required
def get_prix():
    rows = _get_prix_data(request.args.to_dict())
    return  {'success': True, 'rows': rows, 'total': len(rows)}


@app.route('/produit/download_liste_prix', methods=['POST'])
@login_required
def download_liste_prix():
    rf = request.form.to_dict()
    sels = set(json.loads(rf['selected']))
    rows = _get_prix_data(rf)
    for r in rows: r['prix'] = as_currency(r['prix'])
    doc_values = {'items': [r for r in rows if r['no_produit_interne'] in sels or not sels]}
    out_fn = 'liste_de_prix.%s' % ('odt' if hasattr(app, 'is_dev') else 'pdf')
    ren = Renderer('/home/christian/vinum/docs/liste_de_prix.odt', doc_values,
                   '/tmp/%s' % out_fn, overwriteExisting=True)
    ren.run()
    return send_file('/tmp/%s' % out_fn, mimetype='application/pdf',
                     attachment_filename=out_fn, as_attachment=True)


@app.route('/produit/get_nom_domaine', methods=['GET'])
@login_required
def get_nom_domaine():
    return get(g, request, 'produit', ('nom_domaine',))


@app.route('/produit/get_format', methods=['GET'])
@login_required
def get_format():
    return get(g, request, 'produit', ('format',), what='distinct format')


@app.route('/produit/get_pays', methods=['GET'])
@login_required
def get_pays():
    return get(g, request, 'produit', ('pays',), what='distinct pays')


@app.route('/produit/save', methods=['POST'])
@login_required
def save_produit():
    rf = request.form.to_dict()
    npi = rf.pop('no_produit_interne')
    if npi == '': npi = None
    else: rf['no_produit_interne'] = npi # to allow resaving it back after delete with the same id
    produit = pg.upsert(g.db.cursor(), 'produit', where={'no_produit_interne': npi},
                        values=rf, filter_values=True, map_values={'': None})
    g.db.commit()
    return {'success': True, 'data': produit}


@app.route('/produit/delete', methods=['POST'])
@login_required
def delete_produit():
    pg.delete(g.db.cursor(), 'produit',
              where={'no_produit_interne': request.form['no_produit_interne']},
              tighten_sequence=True)
    g.db.commit()
    return {'success': True}
