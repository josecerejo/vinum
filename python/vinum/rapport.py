from vinum import *
from common import *
from appy.pod.renderer import Renderer


@app.route('/rapport/vente', methods=['GET'])
@login_required
def get_rapport_vente():
    where = {('date_commande', '>='): request.args['start_date'], ('date_commande', '<='): request.args['end_date']}
    if request.args['representant_nom']:
        where['representant_nom'] = request.args['representant_nom']
    rows = pg.select(g.db.cursor(), {'commande': 'c', 'commande_item': 'ci', 'produit': 'p', 'client': 'l', 'representant': 'r'},
                     what=['ci.no_produit_interne', 'p.type_vin', 'p.nom_domaine', 'p.format', 'p.quantite_par_caisse',
                           'sum(ci.quantite_caisse) as quantite_caisse'],
                     join={'c.no_commande_facture': 'ci.no_commande_facture', 'ci.no_produit_interne': 'p.no_produit_interne',
                           'c.no_client': 'l.no_client', 'l.representant_id': 'r.representant_id'}, where=where,
                     group_by='type_vin, nom_domaine, format, quantite_par_caisse, ci.no_produit_interne', order_by='type_vin')
    return {'success': True, 'total': len(rows), 'rows': rows}


@app.route('/rapport/vente_download', methods=['GET'])
@login_required
def download_rapport_vente():
    doc_values = {'start_date': '2000-01-01', 'end_date': '2013-01-01',
                  'representant_nom': 'tous'}
    items = []
    for i in range(20):
        items.append(['abcde', 'abcde', '750 ml', 100, 200])
    doc_values['items'] = items

    out_fn = '/tmp/rapport_des_ventes_%s_au_%s_repr=%s.odt' % (start_date, end_date, representant_nom)
    tmpl_fn = 'rapport_des_ventes.odt'
    ren = Renderer('/home/christian/vinum/data/templates/%s' % tmpl_fn, doc_values,
                   out_fn, overwriteExisting=True)
    ren.run()
    return send_file(open(out_fn), mimetype='application/pdf', attachment_filename=out_fn, as_attachment=True)
