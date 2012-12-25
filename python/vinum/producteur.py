from vinum import *
from common import *


@app.route('/producteur/get', methods=['GET'])
def get_producteur():
    return get(g, request, 'producteur', ('nom_producteur',))


@app.route('/producteur/load', methods=['POST'])
def load_producteur():
    producteur = pg.select1r(g.db.cursor(), 'producteur',
                             where={'no_producteur': request.form['no_producteur']})
    return {'success': True, 'data': producteur}
