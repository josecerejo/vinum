import psycopg2, psycopg2.extras, json, datetime
import little_pger as db


DEC2FLOAT = psycopg2._psycopg.new_type(
    psycopg2._psycopg.DECIMAL.values,
    'DEC2FLOAT',
    lambda value, curs: float(value) if value is not None else None)
psycopg2._psycopg.register_type(DEC2FLOAT)


# The '00:00:00' suffix is important for the correct handling of ExtJS dates (I don't know what exactly 
# is the problem with simple iso format)
json_dthandler = lambda obj: obj.strftime('%Y-%m-%d 00:00:00') if obj.__class__ in [datetime.date, datetime.datetime] else None


def get(request, table, query_fields):
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
    if request.args.get('filter', '').strip():
        for filter_arg in json.loads(request.args['filter']):
            if filter_arg['type'] == 'string':
                where[(filter_arg['field'], 'ilike')] = '%%%s%%' % filter_arg['value']
            if filter_arg['type'] == 'numeric':
                where[(filter_arg['field'], comp_op_map[filter_arg['comparison']])] = filter_arg['value']
    elif request.args.get('query', '').strip():
        where[('||'.join(query_fields), 'ilike')] = set(['%%%s%%' % v for v in request.args['query'].split()])

    json_out['total'] = db.count(cursor, table, where=where, debug_assert=False)
    json_out['rows'] = db.select(cursor, table, where=where, offset=request.args['start'], 
                                 limit=request.args['limit'], order_by=order_by, debug_assert=False)
    
    return json.dumps(json_out, default=json_dthandler)


def update(request, table, id):
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    db.update(cursor, table, values=request.form, where={id:request.form[id]})
    conn.commit()
    json_out = {'success': True}
    return json.dumps(json_out, default=json_dthandler)


def create(request, table, id):
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    del request.form[id]
    db.insert(cursor, table, values=request.form)
    key = db.getCurrentPKeyValue(cursor, table, pkey_seq_name='%s_%s_seq' % (table, id))
    conn.commit()
    json_out = {'success': True, id: key}
    return json.dumps(json_out, default=json_dthandler)


def delete(request, table, id):
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    db.delete(cursor, table, where={id:request.form[id]})
    conn.commit()
    json_out = {'success': True}
    return json.dumps(json_out, default=json_dthandler)


