import common


@common.app.route('/client/get', methods=['GET'])
def c_get():
    return common.get('client', ('nom_social',))
    

@common.app.route('/client/update', methods=['POST'])
def c_update():
    return common.update('client', 'no_client')


@common.app.route('/client/create', methods=['POST'])
def c_create():
    return common.create('client', 'no_client')    


@common.app.route('/client/delete', methods=['POST'])
def c_delete():
    return common.delete('client', 'no_client')        
