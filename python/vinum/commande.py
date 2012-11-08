from vinum import *
from common import *
from appy.pod.renderer import Renderer


@app.route('/commande/download_facture', methods=['GET'])
def download_facture():

    params = {}
    params['items'] = [('12', 'ROU724 Valle D\'Oro Rosso .. 2009', '750 ml', '1.59$', '19.08$'),
                       ('12', 'ROU724 Valle D\'Oro Rosso .. 2009', '750 ml', '1.59$', '19.08$'),
                       ('12', 'ROU724 Valle D\'Oro Rosso .. 2009', '750 ml', '1.59$', '19.08$')]

    out_file = '/home/christian/vinum/data/invoice/invoice.pdf'

    ren = Renderer('/home/christian/vinum/data/invoice/vinum_invoice_tmpl.odt', params, 
                   out_file, overwriteExisting=True)
    ren.run()

    return send_file(open(out_file),
                     attachment_filename='invoice.pdf',
                     as_attachment=True)
