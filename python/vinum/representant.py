from vinum import *
from common import *


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
    # to do so, we momentarily grant update priviledge on the commande table, to
    # allow setting facture_est_envoyee to true, and update the logging fields
    admin_conn = psycopg2.connect("dbname=vinum user=vinum_su")
    admin_cur = admin_conn.cursor()
    admin_cur.execute('grant update on table commande to %s' % current_user.u['usager_nom'])
    admin_conn.commit()
    pg.update(g.db.cursor(), 'commande', set={'facture_est_envoyee': True},
              where={'no_commande_facture': request.form['no_commande_facture']})
    # we must not forget to revoke the priviledge after!
    admin_cur.execute('revoke update on table commande from %s' % current_user.u['usager_nom'])
    admin_conn.commit()
    admin_conn.close()
    g.db.commit()
    return {'success': True}
