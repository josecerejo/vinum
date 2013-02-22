from vinum import *
from common import *
from collections import defaultdict
from appy.pod.renderer import Renderer


# !!!
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


def _get_rapport_transaction_data(request):
    if request.args['representant_nom']:
        where['representant_nom'] = request.args['representant_nom']
    q = """ select nom_social, no_client_saq, o.no_commande_facture, o.expedition, date_pickup,
                   date_direct, o.no_succursale_saq, note_commande, montant, sous_total, tps, tvq,
                   type_vin, nom_domaine, format, no_produit_saq, no_demande_saq, quantite_caisse,
                   quantite_par_caisse
            from client c
            inner join commande o on c.no_client = o.no_client
            inner join commande_item ci on o.no_commande_facture = ci.no_commande_facture
            inner join produit p on ci.no_produit_interne = p.no_produit_interne
            left join representant r on r.representant_id = c.representant_id
            where date_commande >= %s and date_commande <= %s"""
    qvals = [request.args['start_date'], request.args['end_date']]
    if request.args['representant_nom']:
        q += ' and representant_nom = %s'
        qvals.append(request.args['representant_nom'])
    q += ' order by o.no_commande_facture'
    cur = g.db.cursor()
    cur.execute(q, qvals)
    return cur.fetchall()


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
    return send_file('/tmp/%s' % out_fn, mimetype='application/pdf',
                     attachment_filename=out_fn, as_attachment=True)


@app.route('/rapport/transaction_download', methods=['GET'])
@login_required
def download_rapport_transaction():
    start_date = request.args['start_date']
    end_date = request.args['end_date']
    representant = request.args['representant_nom'] if request.args['representant_nom'] else 'tous'
    rows = _get_rapport_transaction_data(request)

    # each row: {top: list of 7 items,
    #            subitems: [ <list of 6 items> ]}
    items = []

    ncf_rows = defaultdict(list) # ncf -> []
    for row in rows:
        ncf_rows[row['no_commande_facture']].append(row)

    totals = [0, 0, 0, 0]

    for ncf, rows in ncf_rows.items():
        row0 = rows[0]
        exp = ''
        if row0['expedition'] == 'direct':
            exp = 'direct%s' % (' (%s)' % row['date_direct'] if row['date_direct'] else '')
        elif row0['expedition'] == 'pickup':
            exp = 'pickup%s' % (' (%s)' % row['date_pickup'] if row['date_pickup'] else '')
        elif row['expedition'] == 'succursale':
            exp = 'succursale%s' % (' (%s)' % row['no_succursale_saq'] if row['no_succursale_saq'] else '')
        note = row0['note_commande'] if row0['note_commande'] else ''
        item = {'top': ['%s (%s)' % (row0['nom_social'], row0['no_client_saq'] if row0['no_client_saq'] else '?'),
                        row0['no_commande_facture'], '%s %s' % (exp, note), as_currency(row0['montant']),
                        as_currency(row0['sous_total']), as_currency(row0['tps']), as_currency(row0['tvq'])]}
        subitems = []
        for row in rows:
            subitems.append(['%s, %s' % (row['type_vin'], row['nom_domaine']), row['format'], row['no_produit_saq'],
                             row['no_demande_saq'], '%s(cs)' % row['quantite_caisse'], '%s(bt)' % row['quantite_par_caisse']])
        item['subitems'] = subitems
        items.append(item)
        for i, f in enumerate(['montant', 'sous_total', 'tps', 'tvq']):
            totals[i] += row0[f] if row0[f] else 0

    totals = [as_currency(v) for v in totals]

    doc_values = {'start_date': start_date, 'end_date': end_date,
                  'representant_nom': representant, 'items': items, 'totals': totals}
    out_fn = 'rapport_des_transactions_%s_au_%s_repr=%s.pdf' % (start_date, end_date, representant)
    ren = Renderer('/home/christian/vinum/data/templates/rapport_des_transactions.odt', doc_values,
                   '/tmp/%s' % out_fn, overwriteExisting=True)
    ren.run()
    return send_file('/tmp/%s' % out_fn, mimetype='application/pdf',
                     attachment_filename=out_fn, as_attachment=True)

