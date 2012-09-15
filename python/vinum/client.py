from vinum import *
import common


@app.route('/client/get', methods=['GET'])
def get_client():
    return common.get(request, 'client', ('nom_social', 'no_client_saq'))
    

@app.route('/client/update', methods=['POST'])
def update_client():
    return common.update(request, 'client', 'no_client')


@app.route('/client/create', methods=['POST'])
def create_client():
    return common.create(request, 'client', 'no_client')    


@app.route('/client/delete', methods=['POST'])
def delete_client():
    return common.delete(request, 'client', 'no_client')        
