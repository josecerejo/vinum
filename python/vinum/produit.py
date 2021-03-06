# -*- coding: utf-8 -*-

from vinum import *
from common import *
from appy.pod.renderer import Renderer


@app.route('/produit/get', methods=['GET'])
@login_required
def get_produit():
    if 'no_client' in request.args:
        # client_produit (in commande form)
        return get(g, request, {'produit': 'p', 'client_produit': 'cp',
                                'producteur': 'r'},
                   join={'p.no_produit_interne': 'cp.no_produit_interne',
                         'p.no_producteur': 'r.no_producteur'},
                   where={'no_client': request.args['no_client']})
    else:
        return get(g, request, {'produit':'p','producteur':'r'},
                   join={'p.no_producteur': 'r.no_producteur'},
                   query_fields=('type_vin', 'nom_producteur', 'nom_domaine'),
                   field_map={'no_producteur': 'p.no_producteur'})


def _get_prix_data(request):
    cur = g.db.cursor()
    qvals = []
    if request['type_client'] == 'restaurant' or 'commission_particulier' not in request or \
      not request['commission_particulier']:
        ptc = 'i.prix_%s as prix' % request['type_client']
    else:
        ptc = '(i.prix_coutant * (1 + %f)) as prix' % float(request['commission_particulier'])
    q = """select * from (
                -- statut_inventaire: actif/en reserve/en attente
                select p.*, i.*, r.*, %s
                     from produit p, inventaire i, producteur r
                                where p.no_producteur = r.no_producteur and
                                p.est_actif and
                                i.no_inventaire = (select no_inventaire from inventaire i
                                                   where i.no_produit_interne = p.no_produit_interne and statut_inventaire != 'inactif'
                                                   order by date_commande limit 1)
                union
                -- statut_inventaire: inactif
                select p.*, i.*, r.*, %s
                         from produit p, inventaire i, producteur r
                                where p.no_producteur = r.no_producteur and
                                p.est_actif and
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
                if filter_arg['value'] == 'Nouveau Monde':
                    nm_pays = pg.select(cur, 'producteur', what='distinct pays',
                                        where={('pays', 'not in'): ('France', 'Italie')})
                    q += " and pays in %s"
                    qvals.append(tuple([r['pays'] for r in nm_pays]))
                else:
                    q += " and unaccent(%s) ilike unaccent(%%s) " % filter_arg['field']
                    qvals.append('%%%s%%' % filter_arg['value'])
            else:
                comp_op_map = {'lt':'<', 'gt':'>', 'le':'<=', 'ge':'>=', 'eq':'='}
                q += ' and %s %s %%s ' % (filter_arg['field'], comp_op_map[filter_arg.get('comparison', 'eq')])
                qvals.append(filter_arg['value'])
    # if 'sort' in request:
    #     sort_args = json.loads(request['sort'])
    #     q += ('order by ' + ','.join(['%s %s' % (sa['property'], sa['direction']) for sa in sort_args]))
    # else:
    #     q += "order by type_vin"
    q += u"order by pays, strpos('Rouge Blanc Rosé', couleur), type_vin"
    #print cur.mogrify(q, qvals)
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
    cur = g.db.cursor()
    sels = set(json.loads(rf['selected']))
    rows = _get_prix_data(rf)
    rows = [r for r in rows if r['no_produit_interne'] in sels or not sels]
    for r in rows: r['prix'] = as_currency(r['prix'])
    if current_user.u['representant_id']:
        rep = pg.select1r(cur, 'representant', where={'representant_id': current_user.u['representant_id']})
    else:
        rep = pg.select1r(cur, 'representant', where={'representant_nom': rf['representant_nom'] or 'David Doucet'})
    pays = 'Tous les pays'
    for filter_arg in json.loads(rf['filter']):
        if filter_arg['field'] == 'pays':
            pays = filter_arg['value']
            break
    fl1 = {'particulier': 'Ces prix incluent les taxes et les frais de la Société Roucet.',
           'restaurant': 'Prix sans taxes incluant les droits de la SAQ spécifiques à la restauration s’il y a lieu et les frais de la Société Roucet.'}
    doc_values = {'pays': pays, 'date': datetime.date.today().isoformat(),
                  'url': 'http://www.roucet.com', 'type_liste': 'LPP' if rf['type_client'] == 'particulier' else 'Resto',
                  'footer_line1': fl1[rf['type_client']]}
    doc_values.update(rep)
    sections = []
    prev_pays_couleur = (None, None)
    for row in rows:
        if (row['pays'], row['couleur']) != prev_pays_couleur:
            sections.append({'pays': row['pays'], 'couleur': row['couleur'].lower(), 'rows': []})
        dispo = [u'\u2605' if row['est_en_dispo_reduite'] else '']
        sections[-1]['rows'].append(dispo + [row[f] for f in ['type_vin', 'millesime', 'nom_domaine',
                                                              'region', 'quantite_par_caisse', 'format', 'prix']])
        prev_pays_couleur = (row['pays'], row['couleur'])
    # add plural
    for sect in sections:
        if len(sect['rows']) > 1: sect['couleur'] += 's'
    doc_values['sections'] = sections
    out_fn = 'liste_de_prix.%s' % ('odt' if hasattr(app, 'is_dev') else 'pdf')
    ren = Renderer('/home/christian/vinum/docs/liste_de_prix.odt', doc_values,
                   '/tmp/%s' % out_fn, overwriteExisting=True)
    ren.run()
    return send_file('/tmp/%s' % out_fn, mimetype='application/pdf',
                     attachment_filename=out_fn, as_attachment=True)


@app.route('/produit/get_format', methods=['GET'])
@login_required
def get_format():
    return get_distinct_values(g, request, 'produit', 'format')


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
