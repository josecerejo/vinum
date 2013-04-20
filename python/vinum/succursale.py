# -*- coding: utf-8 -*-

from vinum import *
from common import *


@app.route('/succursale/get', methods=['GET'])
@login_required
def get_succs():
    return get(g, request, 'succursale_saq', ('no_succursale_saq', 'ville', 'adresse'))


@app.route('/succursale/save', methods=['POST'])
@login_required
def save_succ():
    cur = g.db.cursor()
    rf = request.form.to_dict()
    nss = rf.pop('no_succursale_saq')
    if nss == '': nss = None
    else: rf['no_succursale_saq'] = nss
    pg.upsert(g.db.cursor(), 'succursale_saq', values=rf, where={'no_succursale_saq': nss},
              filter_values=True)
    g.db.commit()
    return {'success': True}


@app.route('/succursale/remove', methods=['POST'])
@login_required
def remove_succ():
    pg.delete(g.db.cursor(), 'succursale_saq',
              where={'no_succursale_saq': request.form['no_succursale_saq']},
              tighten_sequence=True)
    g.db.commit()
    return {'success': True}
