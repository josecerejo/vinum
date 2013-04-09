from vinum import *
from common import *
from collections import defaultdict
from appy.pod.renderer import Renderer


def _get_rapport_vente_data(request):
    q = """ select ci.no_produit_interne, p.type_vin, p.nom_domaine, p.format,
                   p.quantite_par_caisse, sum(ci.quantite_caisse) as quantite_caisse,
                   sum(ci.quantite_bouteille) as quantite_bouteille, sum(o.montant) as montant,
                   sum(o.sous_total) as sous_total, sum(o.tps) as tps, sum(o.tvq) as tvq
            from produit p
            inner join commande_item ci on ci.no_produit_interne = p.no_produit_interne
            inner join commande o on o.no_commande_facture = ci.no_commande_facture
            inner join client c on o.no_client = c.no_client
            left join representant r on c.representant_id = r.representant_id
            where statut_item != 'BO'
            and date_commande >= %s and date_commande <= %s
        """
    qvals = [request.args['start_date'], request.args['end_date']]
    if request.args['representant_nom']:
        q += ' and representant_nom = %s'
        qvals.append(request.args['representant_nom'])
    if request.args['type_client']:
        q += ' and type_client = %s'
        qvals.append(request.args['type_client'])
    q += """ group by type_vin, nom_domaine, format, quantite_par_caisse, ci.no_produit_interne
             order by type_vin"""
    cur = g.db.cursor()
    cur.execute(q, qvals)
    return cur.fetchall()


def _get_rapport_transaction_data(request):
    q = """ select nom_social, no_client_saq, o.no_commande_facture, o.expedition, date_pickup,
                   date_direct, o.no_succursale_saq, note_commande, montant, sous_total, tps, tvq,
                   type_vin, nom_domaine, format, no_produit_saq, no_demande_saq, quantite_caisse,
                   quantite_bouteille, quantite_par_caisse, representant_nom
            from client c
            inner join commande o on c.no_client = o.no_client
            inner join commande_item ci on o.no_commande_facture = ci.no_commande_facture
            inner join produit p on ci.no_produit_interne = p.no_produit_interne
            left join representant r on r.representant_id = c.representant_id
            where statut_item != 'BO'
            and date_commande >= %s and date_commande <= %s
        """
    qvals = [request.args['start_date'], request.args['end_date']]
    if request.args['representant_nom']:
        q += ' and representant_nom = %s'
        qvals.append(request.args['representant_nom'])
    if request.args['type_client']:
        q += ' and type_client = %s'
        qvals.append(request.args['type_client'])
    q += ' order by o.no_commande_facture'
    print q
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
    type_client = request.args['type_client'] if request.args['type_client'] else 'tous'
    rows = _get_rapport_vente_data(request)
    items = []
    totals = [0] * 6
    for row in rows:
        items.append([row[c] for c in ['type_vin', 'nom_domaine', 'format', 'quantite_par_caisse', 'quantite_caisse']])
        for i, f in enumerate(['quantite_caisse', 'quantite_bouteille', 'montant', 'sous_total', 'tps', 'tvq']):
            totals[i] += row[f] if row[f] else 0
    totals[2:] = [as_currency(v) for v in totals[2:]]
    doc_values = {'start_date': start_date, 'end_date': end_date, 'representant_nom': representant,
                  'type_client': type_client, 'items': items, 'totals': totals}
    out_fn = 'rapport_des_ventes_%s_au_%s_repr=%s_clients=%s.%s' % (start_date, end_date, representant, type_client, DOC_TYPE)
    ren = Renderer('/home/christian/vinum/docs/rapport_des_ventes.odt', doc_values,
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
    type_client = request.args['type_client'] if request.args['type_client'] else 'tous'
    rows = _get_rapport_transaction_data(request)
    # each row: {top: <list of 7 items>, [bottom: str,]
    #            subitems: <list of 4 items>}
    items = []
    ncf_rows = defaultdict(list) # ncf -> []
    for row in rows:
        ncf_rows[row['no_commande_facture']].append(row)
    totals = [0] * 6
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
        if representant == 'tous':
            item['bottom'] = row0['representant_nom']
        subitems = []
        for row in rows:
            subitems.append(['%s, %s' % (row['type_vin'], row['nom_domaine']), row['format'],
                             '%s(cs)' % row['quantite_caisse'], '%s(bt)' % row['quantite_par_caisse']])
            for i, f in enumerate(['quantite_caisse', 'quantite_bouteille']):
                totals[i] += row[f] if row[f] else 0
        item['subitems'] = subitems
        items.append(item)
        for i, f in enumerate(['montant', 'sous_total', 'tps', 'tvq'], 2):
            totals[i] += row0[f] if row0[f] else 0
    totals[2:] = [as_currency(v) for v in totals[2:]]
    doc_values = {'start_date': start_date, 'end_date': end_date, 'representant_nom': representant,
                  'type_client': type_client, 'items': items, 'totals': totals}
    out_fn = 'rapport_des_transactions_%s_au_%s_repr=%s_clients=%s.%s' % (start_date, end_date, representant, type_client, DOC_TYPE)
    tmpl_fn = '/home/christian/vinum/docs/rapport_des_transactions.odt' if representant == 'tous' else \
        '/home/christian/vinum/docs/rapport_des_transactions_1repr.odt'
    ren = Renderer(tmpl_fn, doc_values, '/tmp/%s' % out_fn, overwriteExisting=True)
    ren.run()
    return send_file('/tmp/%s' % out_fn, mimetype='application/pdf',
                     attachment_filename=out_fn, as_attachment=True)

