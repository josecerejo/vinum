import psycopg2.extras, json
import sys; sys.path.append('/home/christian/gh/little_pger')
import little_pger as pg


# get everything! handles every single possible select query required by the app..
def get(g, request, tables, query_fields=None, query_op='ilike', what='*', join=None, where=None):
    if query_fields is None: query_fields = ()
    if join is None: join = {}
    if where is None: where = {}
    assert query_fields.__class__ is tuple
    cursor = g.db.cursor()
    order_by = None
    if 'sort' in request.args:
        sort_args = json.loads(request.args['sort'])
        order_by = ','.join(['%s %s' % (sa['property'], sa['direction']) for sa in sort_args])

    # todo: put that somewhere that makes more sense
    comp_op_map = {'lt':'<', 'gt':'>', 'le':'<=', 'ge':'>=', 'eq':'='}

    if request.args.get('filter', '').strip():
        for filter_arg in json.loads(request.args['filter']):
            if filter_arg['type'] == 'string':
                where[(filter_arg['field'], 'ilike')] = set(['%%%s%%' % v for v in filter_arg['value'].split()])
            elif filter_arg['type'] == 'list':
                where[filter_arg['field']] = tuple(filter_arg['value'])
            else:
                where[(filter_arg['field'], comp_op_map[filter_arg.get('comparison', 'eq')])] = filter_arg['value']
    elif request.args.get('query', '').strip():
        # autocomplete query
        if query_op.lower() in ['ilike', 'like']:
            where[('||'.join(query_fields), query_op)] = set(['%%%s%%' % v for v in request.args['query'].split()])
        # exact field query: assumes only 1 field, because there is only 1 query value
        else:
            assert len(query_fields) == 1
            where[(query_fields[0], query_op)] = request.args['query']

    json_out = {'success': True}
    json_out['total'] = pg.count(cursor, tables, what=what, join=join, where=where, debug_assert=False)
    json_out['rows'] = pg.select(cursor, tables, what=what, join=join, where=where,
                                 offset=request.args.get('start', None), limit=request.args.get('limit', None),
                                 order_by=order_by, debug_assert=False)
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


def removeTaxes_(v):
    tps = 0.05;
    tvq = 0.095;
    t = tps + (tvq + (tps * tvq));
    return v / (1 + t);
