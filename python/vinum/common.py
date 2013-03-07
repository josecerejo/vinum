import psycopg2.extras, json
import little_pger as pg
from login import *


# type of generated documents (pdf or odt)
DOC_TYPE = 'pdf'
TPS = 0.05
TVQ = 0.09975


# get everything! handles every single possible select query required by the app..
def get(g, request, tables, query_fields=None, query_op='ilike', what='*', join=None, where=None, field_map=None):
    if query_fields is None: query_fields = ()
    if join is None: join = {}
    if where is None: where = {}
    if field_map is None: field_map = {}
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
            f = filter_arg['field']
            if filter_arg['type'] == 'string':
                where[(field_map.get(f, f), 'ilike', 'unaccent')] = set(['%%%s%%' % v for v in filter_arg['value'].split()])
            elif filter_arg['type'] == 'list':
                where[field_map.get(f, f)] = tuple(filter_arg['value'])
            else:
                where[(field_map.get(f, f), comp_op_map[filter_arg.get('comparison', 'eq')])] = filter_arg['value']
    elif request.args.get('query', '').strip():
        # autocomplete query
        if query_op.lower() in ['ilike', 'like']:
            # this is needed because the concat operator (||) doesn't work with null values
            query_fields = ["coalesce(%s::text, '')" % f for f in query_fields]
            where[('||'.join(query_fields), query_op, 'unaccent')] = set(['%%%s%%' % v for v in request.args['query'].split()])
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


# $$$-related utils (could be elsewhere that make more sense!)

def remove_taxes_(v):
    return v / (1 + TPS + TVQ);


def as_currency(v):
    return locale.currency(v if v else 0)
