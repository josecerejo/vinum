from vinum import *
from common import *


@app.route('/visu/ventes', methods=['GET'])
@login_required
def get_ventes_visu():
    cur = g.db.cursor()
    cur.execute("""select extract(year from date_commande) x, sum(montant) y from commande
                   where extract(year from date_commande) between 1996 and 2012 group by x order by x
                """)
    return {'success': True, 'data': cur.fetchall()}
