from vinum import *
from common import *
from appy.pod.renderer import Renderer


def _get_rapport_vente_data(request):
    where = {('date_commande', '>='): request.args['start_date'], ('date_commande', '<='): request.args['end_date']}
    if request.args['representant_nom']:
        where['representant_nom'] = request.args['representant_nom']
    return pg.select(g.db.cursor(), {'commande': 'c', 'commande_item': 'ci', 'produit': 'p', 'client': 'l', 'representant': 'r'},
                     what=['ci.no_produit_interne', 'p.type_vin', 'p.nom_domaine', 'p.format', 'p.quantite_par_caisse',
                           'sum(ci.quantite_caisse) as quantite_caisse'],
                     join={'c.no_commande_facture': 'ci.no_commande_facture', 'ci.no_produit_interne': 'p.no_produit_interne',
                           'c.no_client': 'l.no_client', 'l.representant_id': 'r.representant_id'}, where=where,
                     group_by='type_vin, nom_domaine, format, quantite_par_caisse, ci.no_produit_interne', order_by='type_vin')


@app.route('/rapport/vente', methods=['GET'])
@login_required
def get_rapport_vente():
    rows = _get_rapport_vente_data(request)
    return {'success': True, 'total': len(rows), 'rows': rows}


@app.route('/rapport/vente_download', methods=['GET'])
@login_required
def download_rapport_vente():
    start_date = request.args['start_date']
    end_date = request.args['end_date']
    representant = request.args['representant_nom'] if request.args['representant_nom'] else 'tous'
    rows = _get_rapport_vente_data(request)
    items = [[row[c] for c in ['type_vin', 'nom_domaine', 'format', 'quantite_par_caisse', 'quantite_caisse']]
             for row in rows]
    doc_values = {'start_date': start_date, 'end_date': end_date,
                  'representant_nom': representant, 'items': items}
    out_fn = 'rapport_des_ventes_%s_au_%s_repr=%s.pdf' % (start_date, end_date, representant)
    ren = Renderer('/home/christian/vinum/data/templates/rapport_des_ventes.odt', doc_values,
                   '/tmp/%s' % out_fn, overwriteExisting=True)
    ren.run()
    return send_file(open('/tmp/%s' % out_fn), mimetype='application/pdf',
                     attachment_filename=out_fn, as_attachment=True)
