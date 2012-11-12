import psycopg2, psycopg2.extras, json, datetime, traceback, locale
from flask import *


DEC2FLOAT = psycopg2._psycopg.new_type(
    psycopg2._psycopg.DECIMAL.values,
    'DEC2FLOAT',
    lambda value, curs: float(value) if value is not None else None)
psycopg2._psycopg.register_type(DEC2FLOAT)

locale.setlocale(locale.LC_ALL, 'fr_CA.UTF-8')

def general_error_handler(e):
    tb_str = traceback.format_exc()
    tb_str = tb_str.replace('\n', '<br>')
    return json.dumps({'success' : False, 'error' : 'server', 'error_msg' : tb_str})

# The '00:00:00' suffix is important for the correct handling of ExtJS dates (I don't know what exactly
# is the problem with simple iso format)
json_dthandler = lambda obj: obj.strftime('%Y-%m-%d 00:00:00') if obj.__class__ in [datetime.date, datetime.datetime] else None

class MyFlask(Flask):
    def make_response(self, rv):
        if rv.__class__ is dict:
            rv = json.dumps(rv, default=json_dthandler)
        resp = Flask.make_response(self, rv)
        #resp.headers['Access-Control-Allow-Origin'] = '*'
        #resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With'
        #resp.headers['Access-Control-Allow-Methods'] = 'GET'
        return resp

app = MyFlask('vinum')
app.handle_exception = general_error_handler
#app.debug = True

# #if app.debug:
# if True:
#     import logging
#     file_handler = logging.FileHandler('/tmp/vinum.log')
#     file_handler.setLevel(logging.NOTSET)
#     app.logger.addHandler(file_handler)

@app.before_request
def before_request():
#    request.parameter_storage_class = dict
#    request.dict_storage_class = dict
    g.db = psycopg2.connect("dbname=vinum user=christian",
                            connection_factory=psycopg2.extras.RealDictConnection)

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.close()

try:
    import client
    import produit
    import inventaire
    import commande
except:
    pass
