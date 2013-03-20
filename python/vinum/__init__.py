# -*- coding: utf-8 -*-

import psycopg2, psycopg2.extras, json, datetime, traceback, locale
from flask import *


DEC2FLOAT = psycopg2._psycopg.new_type(
    psycopg2._psycopg.DECIMAL.values,
    'DEC2FLOAT',
    lambda value, curs: float(value) if value is not None else None)
psycopg2._psycopg.register_type(DEC2FLOAT)

locale.setlocale(locale.LC_ALL, 'fr_CA.UTF-8')

def general_error_handler(e):
    if isinstance(e, psycopg2.IntegrityError):
        return json.dumps({'success' : False, 'error' : 'server', 'error_msg' : "Au moins un autre objet dépend de celui que vous tentez de modifier ou de détruire."})
    tb_str = traceback.format_exc()
    tb_str = tb_str.replace('\n', '<br>')
    tb_str = "<b>SVP veuillez copier le message d'erreur suivant et l'envoyer à cjauvin@gmail.com</b>:<br /><br />" + tb_str
    return json.dumps({'success' : False, 'error' : 'server', 'error_msg' : tb_str})

# The '00:00:00' suffix is important for the correct handling of ExtJS dates (I don't know what exactly
# is the problem with simple iso format)
json_dthandler = lambda obj: obj.strftime('%Y-%m-%d 00:00:00') if obj.__class__ in [datetime.date, datetime.datetime] else None

class MyFlask(Flask):
    def make_response(self, rv):
        if rv.__class__ is dict:
            rv = json.dumps(rv, default=json_dthandler)
        resp = Flask.make_response(self, rv)
        return resp


app = MyFlask('vinum')
app.secret_key = 'not really a secret!'
app.handle_exception = general_error_handler


@app.before_request
def before_request():
    g.db = psycopg2.connect("dbname=vinum user=christian",
                            connection_factory=psycopg2.extras.RealDictConnection)

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.close()


# these must be imported in the end like that!
import login, client, commande, produit, producteur, inventaire, rapport, backorder, misc
