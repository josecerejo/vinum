from vinum import *
from common import *


@app.route('/producteur/get', methods=['GET'])
def get_producteur():
    return get(g, request, 'producteur')
