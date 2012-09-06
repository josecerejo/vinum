from vinum.main import *

@app.route('/client/get', methods=['GET'])
def get():
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    json_out = {'success': True}
    #json_out['total'] = db.count(cursor, 'client')

    order_by = None
    if 'sort' in request.args:
        sort_arg = json.loads(request.args['sort'])[0]
        order_by = '%s %s' % (sort_arg['property'], sort_arg['direction'])

    comp_op_map = {'lt':'<', 'gt':'>', 'le':'<=', 'ge':'>=', 'eq':'='}

    where = {}
    if 'filter' in request.args:
        for filter_arg in json.loads(request.args['filter']):
            if filter_arg['type'] == 'string':
                where[(filter_arg['field'], 'ilike')] = '%%%s%%' % filter_arg['value']
            if filter_arg['type'] == 'numeric':
                where[(filter_arg['field'], comp_op_map[filter_arg['comparison']])] = filter_arg['value']

    json_out['total'] = db.count(cursor, 'client', where=where)
    json_out['rows'] = db.select(cursor, 'client', #what=['no_client', 'no_client_saq', 'nom_social', 'date_ouverture_dossier'],
                                 where=where, offset=request.args['start'], limit=request.args['limit'], order_by=order_by)
    
    return json.dumps(json_out, default=json_dthandler)


@app.route('/client/update', methods=['POST'])
def update():
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    db.update(cursor, 'client', values=request.form, where={'no_client':request.form['no_client']})
    conn.commit()
    json_out = {'success': True}
    return json.dumps(json_out, default=json_dthandler)


@app.route('/client/create', methods=['POST'])
def create():
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    del request.form['no_client']
    db.insert(cursor, 'client', values=request.form)
    no_client = db.getCurrentPKeyValue(cursor, 'client', pkey_seq_name='client_no_client_seq')
    conn.commit()
    json_out = {'success': True, 'no_client': no_client}
    return json.dumps(json_out, default=json_dthandler)


@app.route('/client/delete', methods=['POST'])
def delete():
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    db.delete(cursor, 'client', where={'no_client':request.form['no_client']})
    conn.commit()
    json_out = {'success': True}
    return json.dumps(json_out, default=json_dthandler)
