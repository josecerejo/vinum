from vinum import *
from common import *
from appy.pod.renderer import Renderer


@app.route('/representant/get_representants', methods=['GET'])
@login_required
def get_representants():
    return get(g, request, 'representant', ('representant_nom',),
               where={('representant_nom', '!='): 'Vinum'}) # exclude test repr


# special priviledge for a representant: can set commande.facture_est_envoyee
@app.route('/representant/set_facture_est_envoyee', methods=['POST'])
@login_required
def set_facture_est_envoyee():
    assert current_user.u['representant_id']
    # special rule allowing a representant to send a facture email
    # to do so, we momentarily grant the repr an admin_role, allowing him
    # to simply set facture_est_envoyee to true, and update the logging and audit fields
    admin_conn = psycopg2.connect("dbname=vinum user=vinum_su")
    admin_cur = admin_conn.cursor()
    admin_cur.execute('grant admin_role to %s' % current_user.u['usager_nom'])
    admin_conn.commit()
    pg.update(g.db.cursor(), 'commande', set={'facture_est_envoyee': True},
              where={'no_commande_facture': request.form['no_commande_facture']})
    # we must not forget to revoke the priviledge after!
    admin_cur.execute('revoke admin_role from %s' % current_user.u['usager_nom'])
    admin_conn.commit()
    admin_conn.close()
    g.db.commit()
    return {'success': True}


@app.route('/representant/download_bottin', methods=['GET'])
@login_required
def download_bottin():
    assert current_user.u['representant_id']
    cur = g.db.cursor()
    out_fn = 'bottin_des_restaurateurs_repr=%s.%s' % (current_user.u['usager_nom'], 'odt' if hasattr(app, 'is_dev') else 'pdf')
    restos = pg.select(cur, 'client', where={'representant_id': current_user.u['representant_id'],
                                             'type_client': 'restaurant', 'est_actif': True}, order_by='nom_social')
    rn = pg.select1(cur, 'representant', 'representant_nom', where={'representant_id': current_user.u['representant_id']})
    doc_values = {'items': restos, 'representant_nom': rn}
    ren = Renderer('/home/christian/vinum/docs/bottin.odt', doc_values,
                   '/tmp/%s' % out_fn, overwriteExisting=True)
    ren.run()
    return send_file('/tmp/%s' % out_fn, mimetype='application/pdf',
                     attachment_filename=out_fn, as_attachment=True)
