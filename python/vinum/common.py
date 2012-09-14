from main import *


def get(table, query_fields):
    assert query_fields.__class__ is tuple
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    json_out = {'success': True}

    order_by = None
    if 'sort' in request.args:
        sort_arg = json.loads(request.args['sort'])[0]
        order_by = '%s %s' % (sort_arg['property'], sort_arg['direction'])

    # todo: put that somewhere that makes more sense
    comp_op_map = {'lt':'<', 'gt':'>', 'le':'<=', 'ge':'>=', 'eq':'='}

    where = {}
    where_or = {}
    if 'filter' in request.args:
        for filter_arg in json.loads(request.args['filter']):
            if filter_arg['type'] == 'string':
                where[(filter_arg['field'], 'ilike')] = '%%%s%%' % filter_arg['value']
            if filter_arg['type'] == 'numeric':
                where[(filter_arg['field'], comp_op_map[filter_arg['comparison']])] = filter_arg['value']
    elif 'query' in request.args:
        if len(query_fields) == 1:
            where[(query_fields[0], 'ilike')] = '%%%s%%' % request.args['query']
        else:
            for f in query_fields:
                where_or[(f, 'ilike')] = '%%%s%%' % request.args['query']

    json_out['total'] = db.count(cursor, table, where=where, where_or=where_or, debug_assert=False)
    json_out['rows'] = db.select(cursor, table, where=where, where_or=where_or, offset=request.args['start'], 
                                 limit=request.args['limit'], order_by=order_by)
    
    return json.dumps(json_out, default=json_dthandler)


def update(table, id):
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    db.update(cursor, table, values=request.form, where={id:request.form[id]})
    conn.commit()
    json_out = {'success': True}
    return json.dumps(json_out, default=json_dthandler)


def create(table, id):
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    del request.form[id]
    db.insert(cursor, table, values=request.form)
    key = db.getCurrentPKeyValue(cursor, table, pkey_seq_name='%s_%s_seq' % (table, id))
    conn.commit()
    json_out = {'success': True, id: key}
    return json.dumps(json_out, default=json_dthandler)


def delete(table, id):
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    db.delete(cursor, table, where={id:request.form[id]})
    conn.commit()
    json_out = {'success': True}
    return json.dumps(json_out, default=json_dthandler)
