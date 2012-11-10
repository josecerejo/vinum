from vinum import *
from common import *
from appy.pod.renderer import Renderer


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
    doc_type = 'pdf'
    out_file = '/tmp/vinum_facture_%s.%s' % (ncf, doc_type)
    ren = Renderer('/home/christian/vinum/data/invoice/vinum_invoice_tmpl.odt', doc_values,
                   out_file, overwriteExisting=True)
    ren.run()
    return send_file(open(out_file),
                     attachment_filename='vinum_facture_%s.%s' % (ncf, doc_type),
                     as_attachment=True)
