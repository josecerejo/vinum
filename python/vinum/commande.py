# -*- coding: latin-1 -*-

# IMPORTANT: for an important distinction between the "produit" and "item" concepts,
#            refer to a note in model.sql, at the level of the commande_item table.

import re, math
from vinum import *
from common import *
from collections import defaultdict
from appy.pod.renderer import Renderer
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.utils import COMMASPACE
from smtplib import SMTP


# save only commande part, i.e. does not deal with commande_items
@app.route('/commande/save', methods=['POST'])
def save_commande():
    cursor = g.db.cursor()
    rf = request.form.to_dict()
    commande = _save_commande(cursor, rf)
    g.db.commit()
    return {'success': True, 'data': commande}


def _save_commande(cursor, rf):
    ncf = rf.pop('no_commande_facture')
    if ncf == '': ncf = None
    else: rf['no_commande_facture'] = ncf # to allow resaving it back after delete with the same id
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
    return pg.upsert(cursor, 'commande', where={'no_commande_facture': ncf},
                     values=rf, filter_values=True, map_values={'': None})


@app.route('/commande/get', methods=['GET'])
def get_commandes():
    if 'no_client' in request.args:
        return get(g, request, 'commande', where={'no_client': request.args['no_client']})
    else:
        return get(g, request, {'commande': 'c', 'client': 'd'},
                   what=['c.*', 'd.no_client_saq', 'd.nom_social'],
                   join={'c.no_client': 'd.no_client'})


@app.route('/commande/load', methods=['POST'])
def load_commande():
    commande = pg.select1r(g.db.cursor(), 'commande',
                               where={'no_commande_facture': request.form['no_commande_facture']})
    return {'success': True, 'data': commande}


@app.route('/commande/delete', methods=['POST'])
def delete_commande():
    cursor = g.db.cursor()
    rf = request.form.to_dict()
    ncf = rf['no_commande_facture']
    # here it's easier to delete iteratively by distinct produit (i.e. no_produit_interne), to play well
    # with the complicated statut_inventaire restoring logic (see comment in _remove_produit_from_commande below)
    rows = pg.select(cursor, 'commande_item', what='distinct no_produit_interne',
                     where={'no_commande_facture': ncf})
    for row in rows:
        _remove_produit_from_commande(cursor, ncf, row['no_produit_interne'])
    pg.delete(cursor, 'commande', where={'no_commande_facture': ncf})
    g.db.commit()
    return {'success': True}


@app.route('/commande/get_items', methods=['GET'])
def get_items_for_commande():
    return get(g, request, {'commande_item': 'ci', 'produit': 'p'},
               join={'ci.no_produit_interne': 'p.no_produit_interne'},
               where={'ci.no_commande_facture': request.args['no_commande_facture']})


# save commande + commande_items
@app.route('/commande/add_produit', methods=['POST'])
def add_produit_to_commande():
    rf = request.form.to_dict()
    cursor = g.db.cursor()
    # upsert commande part (i.e. possibly creating it)
    commande = _save_commande(cursor, rf)
    ncf = commande['no_commande_facture']
    rem_qc = int(rf['qc'])
    default_commission = float(rf['default_commission'])
    where = {'statut_inventaire': ('actif', u'en réserve'),
             'i.no_produit_interne': rf['no_produit_interne']}
    nps_constraint = request.form.getlist('nps_constraint')
    if nps_constraint:
        where['no_produit_saq'] = tuple(nps_constraint)
    rows = pg.select(g.db.cursor(), {'inventaire': 'i', 'produit': 'p'},
                     join={'p.no_produit_interne':'i.no_produit_interne'},
                     where=where, order_by='date_commande asc')
    prev_statut_inv = None
    for inv in rows:
        inv_id = inv['no_inventaire']
        if prev_statut_inv == 'inactif':
            pg.update(cursor, 'inventaire', set={'statut_inventaire':'actif'}, where={'no_inventaire': inv_id})
        if rem_qc == 0:
            break
        # solde caisses
        qc = min(rem_qc, inv['solde_caisse'])
        rem_qc -= qc
        # solde bouteilles
        qb = min(qc * inv['quantite_par_caisse'], inv['solde_bouteille'])
        inv_update = {'solde_bouteille': inv['solde_bouteille'] - qb,
                      'solde_caisse': inv['solde_caisse'] - qc}
        if inv_update['solde_bouteille'] == 0:
            inv_update['statut_inventaire'] = 'inactif'
        pg.update(cursor, 'inventaire', set=inv_update, where={'no_inventaire': inv_id})
        prev_statut_inv = inv_update.get('statut_inventaire', None)
        ci = inv.copy() # new commande_item
        # look for an existing one (to which we'll add values)
        existing_ci = pg.select1r(cursor, 'commande_item',
                                  where={'no_commande_facture': ncf,
                                         'no_produit_saq': ci['no_produit_saq']}) or defaultdict(int)
        ci['no_commande_facture'] = ncf
        ci['quantite_caisse'] = existing_ci['quantite_caisse'] + qc
        ci['quantite_bouteille'] = existing_ci['quantite_bouteille'] + qb
        ci['commission'] = default_commission
        ci['montant_commission'] = removeTaxes_(inv['prix_coutant']) * default_commission
        ci['statut_item'] = 'OK'
        pg.upsert(cursor, 'commande_item', values=ci, where={'no_commande_facture': ncf,
                                                             'no_produit_saq': ci['no_produit_saq']},
                  filter_values=True)
        #pg.insert(cursor, 'commande_item', values=ci, filter_values=True)
    if rem_qc > 0:
        # backorders
        qpc = pg.select1(cursor, 'produit', 'quantite_par_caisse', where={'no_produit_interne': rf['no_produit_interne']})
        ci = {'no_commande_facture': ncf, 'no_produit_interne': rf['no_produit_interne'], 'quantite_caisse': rem_qc,
              'quantite_bouteille': rem_qc * qpc, 'commission': default_commission, 'statut_item': 'BO'}
        pg.insert(cursor, 'commande_item', values=ci)
    g.db.commit()
    return {'success': True, 'data': commande}


@app.route('/commande/remove_produit', methods=['POST'])
def remove_produit_from_commande():
    rf = request.form.to_dict()
    cursor = g.db.cursor()
    ncf = rf['no_commande_facture']
    npi = rf['no_produit_interne']
    _remove_produit_from_commande(cursor, ncf, npi)
    g.db.commit()
    return {'success': True}


@app.route('/commande/remove_item', methods=['POST'])
def remove_item_from_commande():
    rf = request.form.to_dict()
    cursor = g.db.cursor()
    ncf = rf['no_commande_facture']
    nps = rf['no_produit_saq']
    ci_inv = pg.select1r(cursor, {'commande_item': 'ci', 'inventaire': 'i'},
                         join={'ci.no_produit_saq': 'i.no_produit_saq'},
                         where={'no_commande_facture': ncf, 'ci.no_produit_saq': nps})
    npi = ci_inv['no_produit_interne']
    to_be_set_active = ci_inv['statut_inventaire'] == 'actif' or not pg.exists(cursor, 'inventaire',
                                                                               where={'no_produit_interne': npi,
                                                                                      'statut_inventaire': 'actif'})
    pg.update(cursor, 'inventaire', set={'solde_bouteille': ci_inv['solde_bouteille'] + ci_inv['quantite_bouteille'],
                                         'solde_caisse': ci_inv['solde_caisse'] + ci_inv['quantite_caisse'],
                                         'statut_inventaire': 'actif' if to_be_set_active else u'en réserve'},
              where={'no_inventaire': ci_inv['no_inventaire']})
    pg.delete(cursor, 'commande_item', where={'no_commande_facture': ncf,
                                              'no_produit_saq': nps})
    g.db.commit()
    return {'success': True}


# the logic is a little convoluted here because we need to restore the statut of inventaire records,
# as well as their quantity fields, for a given produit
# (1) for a given product's statut_inventaire=actif inventaire records, set them all to statut_inventaire=en reserve
# (2) for all commande_item records, restore the corresponding inventaire record quantities,
#     and only set the oldest one (the first) to statut_inventaire=actif
def _remove_produit_from_commande(cursor, ncf, npi):
    pg.update(cursor, 'inventaire', set={'statut_inventaire': u'en réserve'}, where={'no_produit_interne': npi,
                                                                         'statut_inventaire': 'actif'})
    rows = pg.select(cursor, {'commande_item': 'ci', 'inventaire': 'i'},
                     join={'ci.no_produit_saq': 'i.no_produit_saq'},
                     where={'no_commande_facture': ncf, 'ci.no_produit_interne': npi},
                     order_by='i.date_commande asc')
    for i, ci_inv in enumerate(rows):
        pg.update(cursor, 'inventaire', set={'solde_bouteille': ci_inv['solde_bouteille'] + ci_inv['quantite_bouteille'],
                                             'solde_caisse': ci_inv['solde_caisse'] + ci_inv['quantite_caisse'],
                                             'statut_inventaire': 'actif' if i == 0 else u'en réserve'},
                  where={'no_inventaire': ci_inv['no_inventaire']})
    pg.delete(cursor, 'commande_item', where={'no_commande_facture':ncf, 'no_produit_interne':npi})


@app.route('/commande/update_item', methods=['POST'])
def update_commande_item():
    rf = request.form.to_dict()
    cursor = g.db.cursor()
    ncf = rf['no_commande_facture']
    item = json.loads(rf['item'])
    prix_coutant = pg.select1(cursor, 'inventaire', 'prix_coutant',
                              where={'no_produit_saq': item['no_produit_saq']})
    item['montant_commission'] = removeTaxes_(float(prix_coutant)) * float(item['commission'])
    ci = pg.update(cursor, 'commande_item', where={'no_commande_facture': rf['no_commande_facture'],
                                                   'no_produit_saq': item['no_produit_saq']},
                   set=item, filter_values=True)
    g.db.commit()
    return {'success': True, 'data': ci}


def _generate_facture(g, ncf, doc_type):
    cursor = g.db.cursor()
    commande = pg.select1r(cursor, 'commande', where={'no_commande_facture':ncf})
    client = pg.select1r(cursor, 'client', where={'no_client': commande['no_client']})
    doc_values = {'items': []}
    doc_values.update(commande)
    doc_values.update(client)
    doc_values['representant_nom'] = pg.select1(cursor, 'representant', 'representant_nom',
                                                where={'representant_id': client['representant_id']})
    cursor.execute("""select * from produit p, commande_item ci
                      where p.no_produit_interne = ci.no_produit_interne
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
    tmpl_fn = 'facture.odt' if client['mode_facturation'] == 'courriel' else 'facture_sans_logo.odt'
    ren = Renderer('/home/christian/vinum/data/templates/%s' % tmpl_fn, doc_values,
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
    cis = pg.select(cursor, 'commande_item', where={'no_commande_facture': ncf})
    n_left = int(math.ceil(len(cis) / 2.))
    doc_values['left_items'] = [(ci['no_produit_saq'], ci['quantite_bouteille']) for ci in cis[:n_left]]
    doc_values['right_items'] = [(ci['no_produit_saq'], ci['quantite_bouteille']) for ci in cis[n_left:]]
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
    mailer.login('commande@roucet.com', '836121234') # !!!
    mailer.sendmail(msg['From'], to_list, msg.as_string())
    mailer.close()
    pg.update(g.db.cursor(), 'commande', set={'facture_est_envoyee': True},
              where={'no_commande_facture': request.form['no_commande_facture']})
    g.db.commit()
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
    mailer.login('commande@roucet.com', '836121234') # !!!
    mailer.sendmail(msg['From'], to_list, msg.as_string())
    mailer.close()
    pg.update(g.db.cursor(), 'commande', set={'bon_de_commande_est_envoye': True},
              where={'no_commande_facture': request.form['no_commande_facture']})
    g.db.commit()
    return {'success': True}
