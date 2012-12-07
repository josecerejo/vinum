# -*- coding: latin-1 -*-

import re, math
from vinum import *
from common import *
from appy.pod.renderer import Renderer
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.utils import COMMASPACE
from smtplib import SMTP


@app.route('/commande/save', methods=['POST'])
def save_commande():
    cursor = g.db.cursor()
    rf = request.form.to_dict()
    ncf = rf.pop('no_commande_facture')
    if ncf == '': ncf = None
    # !!! not sure of this.. could be done in the client as well, or not at all
    if rf['expedition'] == 'direct':
        rf['no_succursale'] = None
        rf['date_pickup'] = None
    elif rf['expedition'] == 'succursale':
        rf['date_direct'] = None
        rf['date_pickup'] = None
    elif rf['expedition'] == 'pickup':
        rf['date_direct'] = None
        rf['no_succursale'] = None        
    commande = pg.upsert(cursor, 'commande', where={'no_commande_facture': ncf},
                         values=rf, filter_values=True, map_values={'': None})
    g.db.commit()
    return {'success': True, 'data': commande}


@app.route('/commande/get', methods=['GET'])
def get_commandes_for_client():
    return get(g, request, 'commande', ('no_client',), query_op='=')


@app.route('/commande/load', methods=['POST'])
def load_commande():
    commande = pg.select1r(g.db.cursor(), 'commande', 
                               where={'no_commande_facture': request.form['no_commande_facture']})
    return {'success': True, 'data': commande}
    

@app.route('/commande/get_items', methods=['GET'])
def get_items_for_commande():
    cursor = g.db.cursor()
    cursor.execute("""select * from commande_produit cp, produit p
                      where cp.no_produit_interne = p.no_produit_interne
                      and cp.no_commande_facture = %s
                   """, [request.args['no_commande_facture']])
    return {'success': True, 'rows': cursor.fetchall()}


@app.route('/commande/add', methods=['POST'])
def add_item_to_commande():
    rf = request.form.to_dict()
    cursor = g.db.cursor()
    if rf['no_commande_facture']:
        ncf = rf['no_commande_facture']
    else:
        del rf['no_commande_facture']
        comm = pg.insert(cursor, 'commande', values=rf, filter_values=True, map_values={'': None})
        ncf = comm['no_commande_facture']

    rem_qc = int(rf['qc'])
    default_commission = float(rf['default_commission'])
    cursor.execute(u"""select *, ceil(solde::real / quantite_par_caisse) as solde_caisse
                       from inventaire i, produit p
                       where i.no_produit_interne = %s and p.no_produit_interne = i.no_produit_interne and
                       statut in ('actif', 'en réserve')
                       order by date_commande asc   
                    """, [rf['no_produit_interne']])
    prev_statut = None
    for inv in cursor.fetchall():
        inv_id = inv['no_inventaire']
        if prev_statut == 'inactif':
            pg.update(cursor, 'inventaire', set={'statut':'actif'}, where={'no_inventaire': inv_id})
        if rem_qc == 0: 
            break        
        # solde caisses
        qc = min(rem_qc, inv['solde_caisse'])
        rem_qc -= qc
        # solde bouteilles
        qb = min(qc * inv['quantite_par_caisse'], inv['solde'])
        inv_update = {'solde': inv['solde'] - qb}
        if inv_update['solde'] == 0:
            inv_update['statut'] = 'inactif'
        pg.update(cursor, 'inventaire', set=inv_update, where={'no_inventaire': inv_id})
        prev_statut = inv_update.get('statut', None)
        # new commande_produit 
        cp = inv.copy()
        cp['no_commande_facture'] = ncf
        cp['quantite_caisse'] = qc
        cp['quantite_bouteille'] = qb
        cp['commission'] = default_commission
        pc = cp['prix_coutant']
        cp['montant_commission'] = removeTaxes_(inv['prix_coutant']) * default_commission
        cp['statut'] = 'OK'
        cp['statut_inventaire'] = inv['statut'] # in case we need to revert it
        pg.insert(cursor, 'commande_produit', values=cp, filter_values=True)    
    if rem_qc > 0:
        # backorders
        qpc = pg.select1(cursor, 'produit', 'quantite_par_caisse', where={'no_produit_interne': rf['no_produit_interne']})
        cp = {'no_commande_facture': ncf, 'no_produit_interne': rf['no_produit_interne'], 'quantite_caisse': rem_qc,
              'quantite_bouteille': rem_qc * qpc, 'commission': default_commission, 'statut': 'BO'}
        pg.insert(cursor, 'commande_produit', values=cp)                                     
    g.db.commit()
    return {'success': True, 'data': {'no_commande_facture': ncf}}


@app.route('/commande/remove', methods=['POST'])
def remove_item_from_commande():
    rf = request.form.to_dict()
    cursor = g.db.cursor()
    ncf = rf['no_commande_facture']
    npi = pg.select1(cursor, 'produit', 'no_produit_interne', where={'type_vin': rf['type_vin']})
    pg.update(cursor, 'inventaire', set={'statut': u'en réserve'}, where={'no_produit_interne': npi,
                                                                         'statut': 'actif'})
    cursor.execute("""select cp.*, i.no_inventaire, i.solde, i.date_commande as dc_inv
                      from commande_produit cp, inventaire i
                      where cp.no_produit_saq = i.no_produit_saq
                      and cp.no_produit_interne = i.no_produit_interne
                      and no_commande_facture = %s and cp.no_produit_interne = %s
                      order by dc_inv asc
                   """, [ncf, npi])
    for i, cpi in enumerate(cursor.fetchall()):
        pg.update(cursor, 'inventaire', set={'solde': cpi['solde'] + cpi['quantite_bouteille'], 
                                             'statut': 'actif' if i == 0 else u'en réserve'},
                  where={'no_inventaire': cpi['no_inventaire']})
    pg.delete(cursor, 'commande_produit', where={'no_commande_facture':ncf, 'no_produit_interne':npi})
    g.db.commit()
    return {'success': True}
    

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
    doc_values = {'left_items': [], 'right_items': []}
    doc_values.update(commande)
    doc_values.update(client)    
    doc_values['representant_nom'] = pg.select1(cursor, 'representant', 'representant_nom', 
                                                where={'representant_id': client['representant_id']})
    if commande['expedition'] == 'pickup':
        doc_values['pu'] = 'X'
        doc_values['date_expedition'] = commande['date_pickup']
    elif commande['expedition'] == 'direct':
        doc_values['dr'] = 'X'
        doc_values['date_expedition'] = commande['date_direct']
    elif commande['expedition'] == 'succursale':
        doc_values['sc'] = 'X'
        doc_values['no_succursale'] = commande['no_succursale']
    cps = pg.select(cursor, 'commande_produit', where={'no_commande_facture': ncf})
    n_left = int(math.ceil(len(cps) / 2.))
    doc_values['left_items'] = [(cp['no_produit_saq'], cp['quantite_bouteille']) for cp in cps[:n_left]]
    doc_values['right_items'] = [(cp['no_produit_saq'], cp['quantite_bouteille']) for cp in cps[n_left:]]
    doc_values['no_commande_facture'] = ncf
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
