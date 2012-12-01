from vinum import *
from common import *


@app.route('/misc/get_succursales', methods=['GET'])
def get_succursales():
    return get(g, request, 'succursale_saq', ('no_succursale', 'ville', 'adresse'))

@app.route('/misc/get_representants', methods=['GET'])
def get_representants():
    return get(g, request, 'representant', ('representant_nom',))
