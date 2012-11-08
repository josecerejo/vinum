from vinum import *
from common import *
from appy.pod.renderer import Renderer


@app.route('/commande/download_facture', methods=['GET'])
def download_facture():

    params = {}
    params['coucou'] = 'allo!'
    params['persons'] = [('Christian!!','Jauvin')]

    out_file = '/home/christian/vinum/data/invoice/result.pdf'

    ren = Renderer('/home/christian/vinum/data/invoice/invoice_tmpl.odt', params, 
                   out_file, overwriteExisting=True)
    ren.run()

    return send_file(open(out_file),
                     attachment_filename='invoice.pdf',
                     as_attachment=True)
