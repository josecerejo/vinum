# -*- coding: latin-1 -*-

# IMPORTANT: for an important distinction between the "produit" and "item" concepts,
#            refer to a note in model.sql, at the level of the commande_item table.

import re, math, os
from vinum import *
from common import *
from collections import defaultdict
from appy.pod.renderer import Renderer
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.utils import COMMASPACE
from smtplib import SMTP


SMTP_PW = open('%s/../../data/smtp_server_infos_KEEP_SECRET.txt' % os.path.dirname(os.path.realpath(__file__))).readline().strip()


# save only commande part, i.e. does not deal with commande_items
@app.route('/commande/save', methods=['POST'])
@login_required
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
        rf['no_succursale_saq'] = None
        rf['date_pickup'] = None
    elif rf['expedition'] == 'succursale':
        rf['date_direct'] = None
        rf['date_pickup'] = None
    elif rf['expedition'] == 'pickup':
        rf['date_direct'] = None
        rf['no_succursale_saq'] = None
    return pg.upsert(cursor, 'commande', where={'no_commande_facture': ncf},
                     values=rf, filter_values=True, map_values={'': None})


def _update_commande(cursor, ncf):
    # here it seems that there is no need to restrict on statut=BO, because those have their mc/qb fields set to null
    sous_total = pg.select(g.db.cursor(), 'commande_item', what={'sum(montant_commission * quantite_bouteille)': 'st'},
                           where={'no_commande_facture': ncf})[0]['st'] or 0
    tps = sous_total * TPS
    tvq = sous_total * TVQ
    montant = sous_total + tps + tvq
    pg.update(g.db.cursor(), 'commande', set={'sous_total': sous_total, 'tps': tps, 'tvq': tvq, 'montant': montant},
              where={'no_commande_facture': ncf})


@app.route('/commande/get', methods=['GET'])
@login_required
def get_commandes():
    if 'no_client' in request.args:
        return get(g, request, 'commande', where={'no_client': request.args['no_client']})
    else:
        # this is a bit hack-ish, should be revised
        request.args = request.args.to_dict()
        request.args['sort'] = request.args['sort'].replace('"no_client"', '"o.no_client"')
        return get(g, request, {'commande': 'o', 'client': 'c', 'representant': 'r'},
                   join={'o.no_client': 'c.no_client', 'c.representant_id': 'r.representant_id'})


@app.route('/commande/load', methods=['POST'])
@login_required
def load_commande():
    commande = pg.select1r(g.db.cursor(), 'commande',
                               where={'no_commande_facture': request.form['no_commande_facture']})
    return {'success': True, 'data': commande}


@app.route('/commande/delete', methods=['POST'])
@login_required
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
    pg.delete(cursor, 'commande', where={'no_commande_facture': ncf}, tighten_sequence=True)
    g.db.commit()
    return {'success': True}


@app.route('/commande/get_items', methods=['GET'])
@login_required
def get_items_for_commande():
    return get(g, request, {'commande_item': 'ci', 'produit': 'p', 'producteur': 'r'},
               join={'ci.no_produit_interne': 'p.no_produit_interne', 'p.no_producteur': 'r.no_producteur'},
               where={'ci.no_commande_facture': request.args['no_commande_facture']})


# save commande + commande_items
@app.route('/commande/add_produit', methods=['POST'])
@login_required
def add_produit_to_commande():
    rf = request.form.to_dict()
    cursor = g.db.cursor()
    # upsert commande part (i.e. possibly creating it)
    commande = _save_commande(cursor, rf)
    ncf = commande['no_commande_facture']
    rem_qc = int(rf['qc'])

    # *** ATTENTION! EXCEPTION POUR LA COMMISSION ***
    comm = float(rf['default_commission'])
    if rf['type_client'] == 'restaurant' and int(rf['no_produit_interne']) in [23, 67]:
        comm = 0.11
   # ***********************************************

    where = {'statut_inventaire': ('actif', u'en r�serve'),
             'i.no_produit_interne': rf['no_produit_interne']}
    # this is used in the case that the user selected a particular row from the inventaire,
    # to retrieve bottles ONLY from that record (i.e. a given "produit SAQ")
    nps_constraint = request.form.getlist('nps_constraint')
    if nps_constraint:
        where['no_produit_saq'] = tuple(nps_constraint)
    rows = pg.select(g.db.cursor(), {'inventaire': 'i', 'produit': 'p'},
                     join={'p.no_produit_interne':'i.no_produit_interne'},
                     where=where, order_by='date_commande asc')
    prev_statut_inv = None
    for inv in rows:
        # fill commande_items by order of date_commande inventaire items, taking the max
        # available quantity from each
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
        ci['commission'] = comm
        ci['montant_commission'] = remove_taxes_(inv['prix_coutant']) * comm
        ci['statut_item'] = 'OK'
        pg.upsert(cursor, 'commande_item', values=ci, where={'no_commande_facture': ncf,
                                                             'no_produit_saq': ci['no_produit_saq']},
                  filter_values=True)
    if rem_qc > 0:
        # if we still have cases at this point, it's a BO, i.e. a commande_item with statut=BO (not a
        # 'backorder' table row yet though!)
        qpc = pg.select1(cursor, 'produit', 'quantite_par_caisse', where={'no_produit_interne': rf['no_produit_interne']})
        ci = {'no_commande_facture': ncf, 'no_produit_interne': rf['no_produit_interne'], 'quantite_caisse': rem_qc,
              'quantite_bouteille': rem_qc * qpc, 'commission': comm, 'statut_item': 'BO'}
        existing_ci = pg.select1r(cursor, 'commande_item', where={'no_commande_facture': ncf, 'statut_item': 'BO',
                                                             'no_produit_interne': rf['no_produit_interne']})
        if existing_ci:
            ci['quantite_bouteille'] += existing_ci['quantite_bouteille']
            ci['quantite_caisse'] += existing_ci['quantite_caisse']
        ci = pg.upsert(cursor, 'commande_item', values=ci, where={'no_commande_facture': ncf, 'statut_item': 'BO',
                                                                  'no_produit_interne': rf['no_produit_interne']})
    # check for already existing 'backorder' row/item; if found, return it to the client for it to
    # pop an update dialog (allowing to modify/delete the backorder item)
    bo = pg.select1r(cursor, 'backorder', where={'no_client': rf['no_client'], 'no_produit_interne': rf['no_produit_interne']})
    if bo:
        commande['backorder'] = bo
    elif rem_qc > 0:
        # not found, but there was a BO in the first place, so add it as a backorder item
        bo = {'no_client': rf['no_client'], 'no_produit_interne': rf['no_produit_interne'],
              'date_bo': rf['date_commande'], 'quantite_caisse': ci['quantite_caisse'],
              'quantite_bouteille': ci['quantite_bouteille']}
        pg.insert(cursor, 'backorder', values=bo)
    _update_commande(cursor, ncf)
    g.db.commit()
    return {'success': True, 'data': commande}


@app.route('/commande/remove_produit', methods=['POST'])
@login_required
def remove_produit_from_commande():
    rf = request.form.to_dict()
    cursor = g.db.cursor()
    ncf = rf['no_commande_facture']
    npi = rf['no_produit_interne']
    _remove_produit_from_commande(cursor, ncf, npi)
    _update_commande(cursor, ncf)
    g.db.commit()
    return {'success': True}


@app.route('/commande/remove_item', methods=['POST'])
@login_required
def remove_item_from_commande():
    rf = request.form.to_dict()
    cursor = g.db.cursor()
    ncf = rf['no_commande_facture']
    nps = rf['no_produit_saq']
    if nps:
        ci_inv = pg.select1r(cursor, {'commande_item': 'ci', 'inventaire': 'i'},
                             join={'ci.no_produit_saq': 'i.no_produit_saq'},
                             where={'no_commande_facture': ncf, 'ci.no_produit_saq': nps})
        npi = ci_inv['no_produit_interne']
        to_be_set_active = ci_inv['statut_inventaire'] == 'actif' or not pg.exists(cursor, 'inventaire',
                                                                                   where={'no_produit_interne': npi,
                                                                                          'statut_inventaire': 'actif'})
        pg.update(cursor, 'inventaire', set={'solde_bouteille': ci_inv['solde_bouteille'] + ci_inv['quantite_bouteille'],
                                             'solde_caisse': ci_inv['solde_caisse'] + ci_inv['quantite_caisse'],
                                             'statut_inventaire': 'actif' if to_be_set_active else u'en r�serve'},
                  where={'no_inventaire': ci_inv['no_inventaire']})
        pg.delete(cursor, 'commande_item',
                  where={'no_commande_facture': ncf, 'no_produit_saq': nps},
                  tighten_sequence=True)
    else:
        # statut_item=='BO'
        npi = rf['no_produit_interne']
        pg.delete(cursor, 'commande_item',
                  where={'no_commande_facture': ncf, 'no_produit_interne': npi,
                         'statut_item': 'BO'},
                  tighten_sequence=True)
    _update_commande(cursor, ncf)
    g.db.commit()
    return {'success': True}


# the logic is a little convoluted here because we need to restore the statut of inventaire records,
# as well as their quantity fields, for a given produit
# (1) for a given product's statut_inventaire=actif inventaire records, set them all to statut_inventaire=en reserve
# (2) for all commande_item records, restore the corresponding inventaire record quantities,
#     and only set the oldest one (the first) to statut_inventaire=actif
def _remove_produit_from_commande(cursor, ncf, npi):
    pg.update(cursor, 'inventaire', set={'statut_inventaire': u'en r�serve'}, where={'no_produit_interne': npi,
                                                                         'statut_inventaire': 'actif'})
    rows = pg.select(cursor, {'commande_item': 'ci', 'inventaire': 'i'},
                     join={'ci.no_produit_saq': 'i.no_produit_saq'},
                     where={'no_commande_facture': ncf, 'ci.no_produit_interne': npi},
                     order_by='i.date_commande asc')
    for i, ci_inv in enumerate(rows):
        pg.update(cursor, 'inventaire', set={'solde_bouteille': ci_inv['solde_bouteille'] + ci_inv['quantite_bouteille'],
                                             'solde_caisse': ci_inv['solde_caisse'] + ci_inv['quantite_caisse'],
                                             'statut_inventaire': 'actif' if i == 0 else u'en r�serve'},
                  where={'no_inventaire': ci_inv['no_inventaire']})
    pg.delete(cursor, 'commande_item',
              where={'no_commande_facture':ncf, 'no_produit_interne':npi},
              tighten_sequence=True)


@app.route('/commande/update_item', methods=['POST'])
@login_required
def update_commande_item():
    rf = request.form.to_dict()
    cursor = g.db.cursor()
    ncf = rf['no_commande_facture']
    item = json.loads(rf['item'])
    prix_coutant = pg.select1(cursor, 'inventaire', 'prix_coutant',
                              where={'no_produit_saq': item['no_produit_saq']})
    item['montant_commission'] = remove_taxes_(float(prix_coutant)) * float(item['commission'])
    ci = pg.update(cursor, 'commande_item', where={'no_commande_facture': rf['no_commande_facture'],
                                                   'no_produit_saq': item['no_produit_saq']},
                   set=item, filter_values=True)
    _update_commande(cursor, ncf)
    g.db.commit()
    return {'success': True, 'data': ci}


def _generate_facture(g, ncf, with_logo=True):
    cursor = g.db.cursor()
    commande = pg.select1r(cursor, 'commande', where={'no_commande_facture':ncf})
    client = pg.select1r(cursor, 'client', where={'no_client': commande['no_client']})
    doc_values = {'elems': []}
    doc_values.update(commande)
    doc_values.update(client)
    doc_values['representant_nom'] = pg.select1(cursor, 'representant', 'representant_nom',
                                                where={'representant_id': client['representant_id']})
    rows = pg.select(cursor, {'produit':'p', 'commande_item':'ci', 'producteur':'r', 'inventaire':'i'},
                     join={'p.no_produit_interne':'ci.no_produit_interne', 'p.no_producteur':'r.no_producteur',
                           'ci.no_produit_saq':'i.no_produit_saq'}, where={'ci.no_commande_facture': ncf,
                                                                           'statut_item': 'OK'},
                     order_by='type_vin')
    for row in rows:
        doc_values['elems'].append([row['quantite_bouteille'], row['type_vin'], row['nom_domaine'], row['millesime'],
                                    row['no_produit_saq'], row['format'], as_currency(row['montant_commission']),
                                    as_currency(row['montant_commission'] * row['quantite_bouteille'])])
    for f in ['sous_total', 'tps', 'tvq', 'montant']:
        doc_values[f] = as_currency(doc_values[f])
    out_fn = '/tmp/vinum_facture_%s.%s' % (ncf, 'odt' if hasattr(app, 'is_dev') else 'pdf')
    tmpl_fn = 'facture.odt' if with_logo else 'facture_sans_logo.odt'
    ren = Renderer('/home/christian/vinum/docs/%s' % tmpl_fn, doc_values,
                   out_fn, overwriteExisting=True)
    ren.run()
    return out_fn


def _generate_bdc(g, ncf):
    cursor = g.db.cursor()
    commande = pg.select1r(cursor, 'commande', where={'no_commande_facture':ncf})
    client = pg.select1r(cursor, 'client', where={'no_client': commande['no_client']})
    doc_values = {'left_items': [], 'right_items': []}
    doc_values.update(commande)
    doc_values.update(client)
    doc_values['representant_nom'] = pg.select1(cursor, 'representant', 'representant_nom',
                                                where={'representant_id': client['representant_id']})
    doc_values.update({'pu': None, 'dr': None, 'sc': None})
    if commande['expedition'] == 'pickup':
        doc_values['pu'] = 'X'
        doc_values['date_expedition'] = commande['date_pickup']
    elif commande['expedition'] == 'direct':
        doc_values['dr'] = 'X'
        doc_values['date_expedition'] = commande['date_direct']
    elif commande['expedition'] == 'succursale':
        doc_values['sc'] = 'X'
        doc_values['no_succursale_saq'] = commande['no_succursale_saq']
    cis = pg.select(cursor, 'commande_item', where={'no_commande_facture': ncf, 'statut_item': 'OK'})
    left = []
    right = []
    if len(cis) <= 10: # left column
        left = cis
    elif len(cis) <= 20: # left full, rest right
        left = cis[:10]
        right = cis[10:]
    else: # left/right event
        n = int(len(cis) / 2) + 1
        left = cis[:n]
        right = cis[n:]
    doc_values['left_items'] = [('%s-' % i, ci['no_produit_saq'], ci['quantite_bouteille']) for i, ci in enumerate(left, 1)]
    doc_values['right_items'] = [('%s-' % i, ci['no_produit_saq'], ci['quantite_bouteille']) for i, ci in enumerate(right, len(left) + 1)]
    doc_values['no_commande_facture'] = ncf
    out_fn = '/tmp/vinum_bdc_%s.%s' % (ncf, 'odt' if hasattr(app, 'is_dev') else 'pdf')
    ren = Renderer('/home/christian/vinum/docs/bon_de_commande.odt', doc_values,
                   out_fn, overwriteExisting=True)
    ren.run()
    return out_fn


@app.route('/commande/download_facture', methods=['GET'])
@login_required
def download_facture():
    ncf = request.args['no_commande_facture']
    out_fn = _generate_facture(g, ncf, request.args['logo']=='1')
    return send_file(out_fn,
                     mimetype='application/pdf',
                     attachment_filename='vinum_facture_%s.%s' % (ncf, 'pdf'),
                     as_attachment=request.args['attach']=='1')


@app.route('/commande/download_bdc', methods=['GET'])
@login_required
def download_bdc():
    ncf = request.args['no_commande_facture']
    out_fn = _generate_bdc(g, ncf)
    return send_file(out_fn,
                     mimetype='application/pdf',
                     attachment_filename='vinum_bon_de_commande_%s.%s' % (ncf, 'pdf'),
                     as_attachment=request.args['attach']=='1')


@app.route('/commande/email_facture', methods=['POST'])
@login_required
def email_facture():
    msg = MIMEMultipart()
    enc = 'latin-1'
    msg['Subject'] = request.form['subject'].encode(enc)
    msg['From'] = u'Soci�t� Roucet <commande@roucet.com>'.encode(enc)
    to_list = re.split('[ ,;:\t\n]+', request.form['email_addresses'])
    msg['To'] = COMMASPACE.join(to_list)
    msg['Reply-to'] = 'commande@roucet.com'
    try:
        msg.attach(MIMEText(request.form['msg'].encode(enc), 'plain', enc))
    except:
        msg.attach(MIMEText(request.form['msg'].encode('utf8'), 'plain', 'utf8'))
    if 'include_pdf' in request.form:
        out_fn = _generate_facture(g, request.form['no_commande_facture'])
        part = MIMEApplication(open(out_fn, "rb").read())
        part.add_header('Content-Disposition', 'attachment', filename="facture_roucet.pdf")
        msg.attach(part)
    mailer = SMTP('mail.roucet.com', 587)
    mailer.login('commande@roucet.com', SMTP_PW)
    mailer.sendmail(msg['From'], to_list, msg.as_string())
    mailer.close()
    # if user is admin, set facture_est_envoyee to True, if repr, this will
    # be done in the next ajax call (to /representant/set_facture_est_envoyee)
    if not current_user.u['representant_id']:
        pg.update(g.db.cursor(), 'commande', set={'facture_est_envoyee': True},
                  where={'no_commande_facture': request.form['no_commande_facture']})
        g.db.commit()
    return {'success': True}


@app.route('/commande/email_bdc', methods=['POST'])
@login_required
def email_bdc():
    msg = MIMEMultipart()
    enc = 'latin-1'
    msg['Subject'] = request.form['subject'].encode(enc)
    msg['From'] = u'Soci�t� Roucet <commande@roucet.com>'.encode(enc)
    to_list = re.split('[ ,;:\t\n]+', request.form['email_addresses'])
    msg['To'] = COMMASPACE.join(to_list)
    msg['Reply-to'] = 'commande@roucet.com'
    msg.attach(MIMEText(request.form['msg'].encode(enc), 'plain', enc))
    if 'include_pdf' in request.form:
        out_fn = _generate_bdc(g, request.form['no_commande_facture'])
        part = MIMEApplication(open(out_fn, "rb").read())
        part.add_header('Content-Disposition', 'attachment', filename="bon_de_commande_roucet.pdf")
        msg.attach(part)
    mailer = SMTP('mail.roucet.com', 587)
    mailer.login('commande@roucet.com', SMTP_PW)
    mailer.sendmail(msg['From'], to_list, msg.as_string())
    mailer.close()
    pg.update(g.db.cursor(), 'commande', set={'bon_de_commande_est_envoye': True,
                                              'bon_de_commande_heure_envoi': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')},
              where={'no_commande_facture': request.form['no_commande_facture']})
    g.db.commit()
    return {'success': True}
