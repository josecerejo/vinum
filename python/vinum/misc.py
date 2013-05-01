from vinum import *
from common import *


@app.route('/misc/get_representants', methods=['GET'])
def get_representants():
    return get(g, request, 'representant', ('representant_nom',),
               where={('representant_nom', '!='): 'Vinum'}) # exclude test repr
