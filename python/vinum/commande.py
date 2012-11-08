from vinum import *
from common import *


@app.route('/commande/download_facture', methods=['GET'])
def download_facture():
    return send_file(open('/home/christian/vinum/data/invoice/invoice.pdf'),
                     attachment_filename='invoice.pdf',
                     as_attachment=True)
