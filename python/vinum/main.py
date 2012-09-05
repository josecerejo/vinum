import traceback, datetime, psycopg2, psycopg2.extras
import little_pger as db
from flask import *

app = Flask('vinum')
app.debug = True

def general_error_handler(e):
    tb_str = traceback.format_exc()
    tb_str = tb_str.replace('\n', '<br>')
    return json.dumps({'success' : False, 'error' : 'server', 'error_msg' : tb_str})

app.handle_exception = general_error_handler

json_dthandler = lambda obj: obj.isoformat() if obj.__class__ in [datetime.date, datetime.datetime] else None

try:
    from vinum import *
    from vinum.client import *
except:
    pass
