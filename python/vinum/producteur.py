from vinum import *
from common import *


@app.route('/producteur/get', methods=['GET'])
@login_required
def get_producteur():
    return get(g, request, 'producteur', ('nom_producteur',))


@app.route('/producteur/save', methods=['POST'])
@login_required
def save_producteur():
    rf = request.form.to_dict()
    np = rf.pop('no_producteur')
    if np == '': np = None
    else: rf['no_producteur'] = np # to allow resaving it back after delete with the same id
    producteur = pg.upsert(g.db.cursor(), 'producteur', where={'no_producteur': np},
                           values=rf, filter_values=True, map_values={'': None})
    g.db.commit()
    return {'success': True, 'data': producteur}


@app.route('/producteur/delete', methods=['POST'])
@login_required
def delete_producteur():
    pg.delete(g.db.cursor(), 'producteur', where={'no_producteur': request.form['no_producteur']},
              tighten_sequence=True)
    g.db.commit()
    return {'success': True}
