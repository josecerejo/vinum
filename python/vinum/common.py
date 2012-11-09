import psycopg2.extras, json
import little_pger as pg


def get(g, request, table, query_fields):
    assert query_fields.__class__ is tuple
    cursor = g.db.cursor()
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

    json_out = {'success': True}
    json_out['total'] = pg.count(cursor, table, where=where, debug_assert=False)
    json_out['rows'] = pg.select(cursor, table, where=where, offset=request.args['start'],
                                 limit=request.args['limit'], order_by=order_by, debug_assert=False)
    return json_out


def update(g, request, table, id):
    cursor = g.db.cursor()
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    pg.update(cursor, table, values=request.form, where={id:request.form[id]})
    g.db.commit()
    return {'success': True}


def create(g, request, table, id):
    cursor = g.db.cursor()
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    del request.form[id]
    pg.insert(cursor, table, values=request.form)
    key = pg.getCurrentPKeyValue(cursor, table, pkey_seq_name='%s_%s_seq' % (table, id))
    g.db.commit()
    return {'success': True, id: key}


def delete(g, request, table, id):
    cursor = g.db.cursor()
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    pg.delete(cursor, table, where={id:request.form[id]})
    g.db.commit()
    return {'success': True}
