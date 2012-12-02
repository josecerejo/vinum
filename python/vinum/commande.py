# -*- coding: latin-1 -*-

import re
from vinum import *
from common import *
from appy.pod.renderer import Renderer
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.utils import COMMASPACE
from smtplib import SMTP


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


def _generate_facture(g, ncf, doc_type):
    cursor = g.db.cursor()
    commande = pg.select1r(cursor, 'commande', where={'no_commande_facture':ncf})
    client = pg.select1r(cursor, 'client', where={'no_client': commande['no_client']})
    doc_values = {'items': []}
    doc_values.update(commande)
    doc_values.update(client)    
    doc_values['representant_nom'] = pg.select1(cursor, 'representant', 'representant_nom', 
                                                where={'representant_id': client['representant_id']})
    cursor.execute("""select * from produit p, commande_produit cp 
                      where p.no_produit_interne = cp.no_produit_interne
                      and no_commande_facture = %s""", [ncf])
    sous_total = 0
    for row in cursor.fetchall():
        montant_comm_x_qb = row['montant_commission'] * row['quantite_bouteille']
        sous_total += montant_comm_x_qb
        doc_values['items'].append([row['quantite_bouteille'], row['type_vin'], row['no_produit_saq'], 
                                    row['format'], locale.currency(row['montant_commission']), 
                                    locale.currency(montant_comm_x_qb)])
    tps = sous_total * 0.05
    tvq = (sous_total + tps) * 0.095
    total = sous_total + tps + tvq
    doc_values['sous_total'] = locale.currency(sous_total)
    doc_values['tps'] = locale.currency(tps)
    doc_values['tvq'] = locale.currency(tvq)
    doc_values['total'] = locale.currency(total)
    out_fn = '/tmp/vinum_facture_%s.%s' % (ncf, doc_type)
    ren = Renderer('/home/christian/vinum/data/templates/facture.odt', doc_values,
                   out_fn, overwriteExisting=True)
    ren.run()
    return out_fn


def _generate_bdc(g, ncf, doc_type):
    cursor = g.db.cursor()
    commande = pg.select1r(cursor, 'commande', where={'no_commande_facture':ncf})
    client = pg.select1r(cursor, 'client', where={'no_client': commande['no_client']})
    doc_values = {'items': []}
    doc_values.update(commande)
    doc_values.update(client)    
    doc_values['representant_nom'] = pg.select1(cursor, 'representant', 'representant_nom', 
                                                where={'representant_id': client['representant_id']})
    doc_values['pu'] = 'X'
    # cursor.execute("""select * from produit p, commande_produit cp 
    #                   where p.no_produit_interne = cp.no_produit_interne
    #                   and no_commande_facture = %s""", [ncf])
    # sous_total = 0
    # for row in cursor.fetchall():
    #     montant_comm_x_qb = row['montant_commission'] * row['quantite_bouteille']
    #     sous_total += montant_comm_x_qb
    #     doc_values['items'].append([row['quantite_bouteille'], row['type_vin'], row['no_produit_saq'], 
    #                                 row['format'], locale.currency(row['montant_commission']), 
    #                                 locale.currency(montant_comm_x_qb)])
    # tps = sous_total * 0.05
    # tvq = (sous_total + tps) * 0.095
    # total = sous_total + tps + tvq
    # doc_values['sous_total'] = locale.currency(sous_total)
    # doc_values['tps'] = locale.currency(tps)
    # doc_values['tvq'] = locale.currency(tvq)
    # doc_values['total'] = locale.currency(total)
    out_fn = '/tmp/vinum_bdc_%s.%s' % (ncf, doc_type)
    ren = Renderer('/home/christian/vinum/data/templates/bon_de_commande.odt', doc_values,
                   out_fn, overwriteExisting=True)
    ren.run()
    return out_fn
    

@app.route('/commande/download_facture', methods=['GET'])
def download_facture():
    ncf = request.args['no_commande_facture']
    out_fn = _generate_facture(g, ncf, 'pdf')
    return send_file(open(out_fn),
                     mimetype='application/pdf',
                     attachment_filename='vinum_facture_%s.%s' % (ncf, 'pdf'),
                     as_attachment=request.args['attach']=='1')


@app.route('/commande/download_bdc', methods=['GET'])
def download_bdc():
    ncf = request.args['no_commande_facture']
    out_fn = _generate_bdc(g, ncf, 'pdf')
    return send_file(open(out_fn),
                     mimetype='application/pdf',
                     attachment_filename='vinum_bon_de_commande_%s.%s' % (ncf, 'pdf'),
                     as_attachment=request.args['attach']=='1')


@app.route('/commande/email_facture', methods=['POST'])
def email_facture():
    msg = MIMEMultipart()
    enc = 'latin-1'
    msg['Subject'] = request.form['subject'].encode(enc)
    msg['From'] = u'Société Roucet <commande@roucet.com>'.encode(enc)
    to_list = re.split('[ ,;:\t\n]+', request.form['email_addresses'])
    msg['To'] = COMMASPACE.join(to_list)
    msg['Reply-to'] = 'commande@roucet.com'
    msg.attach(MIMEText(request.form['msg'].encode(enc), 'plain', enc))
    if 'include_pdf' in request.form:
        out_fn = _generate_facture(g, request.form['no_commande_facture'], 'pdf')
        part = MIMEApplication(open(out_fn, "rb").read())
        part.add_header('Content-Disposition', 'attachment', filename="facture_roucet.pdf")
        msg.attach(part)
    mailer = SMTP('mail.roucet.com')
    mailer.login('commande@roucet.com', '836121234')
    mailer.sendmail(msg['From'], to_list, msg.as_string())
    mailer.close()
    return {'success': True}


@app.route('/commande/email_bdc', methods=['POST'])
def email_bdc():
    msg = MIMEMultipart()
    enc = 'latin-1'
    msg['Subject'] = request.form['subject'].encode(enc)
    msg['From'] = u'Société Roucet <commande@roucet.com>'.encode(enc)
    to_list = re.split('[ ,;:\t\n]+', request.form['email_addresses'])
    msg['To'] = COMMASPACE.join(to_list)
    msg['Reply-to'] = 'commande@roucet.com'
    msg.attach(MIMEText(request.form['msg'].encode(enc), 'plain', enc))
    if 'include_pdf' in request.form:
        out_fn = _generate_bdc(g, request.form['no_commande_facture'], 'pdf')
        part = MIMEApplication(open(out_fn, "rb").read())
        part.add_header('Content-Disposition', 'attachment', filename="bon_de_commande_roucet.pdf")
        msg.attach(part)
    mailer = SMTP('mail.roucet.com')
    mailer.login('commande@roucet.com', '836121234')
    mailer.sendmail(msg['From'], to_list, msg.as_string())
    mailer.close()
    return {'success': True}
