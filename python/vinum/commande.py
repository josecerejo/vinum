from vinum import *
from common import *
from appy.pod.renderer import Renderer
from collections import defaultdict


@app.route('/commande/save', methods=['POST'])
def save():
    cursor = g.db.cursor()
    rf = request.form.to_dict()
    if rf['no_commande_facture']:
        ncf = rf['no_commande_facture']
    else:
        del rf['no_commande_facture']
        comm = pg.insert(cursor, 'commande', values=rf, filter_values=True, map_values={'': None})
        ncf = comm['no_commande_facture']
    pg.delete(cursor, 'commande_produit', where={'no_commande_facture': ncf})
    for item in json.loads(rf['items']):
        item['no_commande_facture'] = ncf
        pg.insert(cursor, 'commande_produit', values=item, filter_values=True)
    g.db.commit()
    return {'success': True, 'no_commande_facture': ncf}


@app.route('/commande/download_facture', methods=['GET'])
def download_facture():
    cursor = g.db.cursor()
    ncf = request.args['no_commande_facture']
    commande = pg.select1r(cursor, 'commande', where={'no_commande_facture':ncf})
    client = pg.select1r(cursor, 'client', where={'no_client': commande['no_client']})
    doc_values = {'items': []}
    doc_values.update(commande)
    doc_values.update(client)    
    cursor.execute("""select * from produit p, inventaire i, 
                          (select no_produit_saq, sum(quantite_bouteille) as qb
                               from commande_produit where no_commande_facture = %s 
                              group by no_produit_saq, quantite_bouteille) c 
                      where p.no_produit_interne = i.no_produit_interne and 
                      c.no_produit_saq = i.no_produit_saq""", [ncf])
    produits = defaultdict(lambda: defaultdict(int)) # type_vin -> {}
    rows = cursor.fetchall()
    for row in rows:
        produits[row['type_vin']]['qte'] += row['qb']
        produits[row['type_vin']]['format'] = row['format']
        produits[row['type_vin']]['prix_unitaire'] = row['prix_coutant']
        produits[row['type_vin']]['total'] += (row['qb'] * row['prix_coutant'])
    sous_total = 0
    for tv, p in produits.items():
        sous_total += p['total']
        doc_values['items'].append([p['qte'], tv, p['format'], locale.currency(p['prix_unitaire']), 
                                    locale.currency(p['total'])])
    tps = sous_total * 0.05
    tvq = (sous_total + tps) * 0.095
    total = sous_total + tps + tvq
    doc_values['sous_total'] = locale.currency(sous_total)
    doc_values['tps'] = locale.currency(tps)
    doc_values['tvq'] = locale.currency(tvq)
    doc_values['total'] = locale.currency(total)
    doc_type = 'pdf'
    out_file = '/tmp/vinum_facture_%s.%s' % (ncf, doc_type)
    ren = Renderer('/home/christian/vinum/data/invoice/vinum_invoice_tmpl.odt', doc_values,
                   out_file, overwriteExisting=True)
    ren.run()
    return send_file(open(out_file),
                     attachment_filename='vinum_facture_%s.%s' % (ncf, doc_type),
                     as_attachment=True)
