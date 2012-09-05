from vinum.main import *

@app.route('/client/get', methods=['GET'])
def get():
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    json_out = {'success': True}
    json_out['total'] = count(cursor, 'client')

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
        
    json_out['rows'] = select(cursor, 'client', what=['no_client', 'no_client_saq', 'nom_social', 'date_ouverture_dossier'],
                              where=where, offset=request.args['start'], limit=request.args['limit'], order_by=order_by)                              

    return json.dumps(json_out, default=json_dthandler)
