from flask import *
import traceback

def general_error_handler(e):
    tb_str = traceback.format_exc()
    tb_str = tb_str.replace('\n', '<br>')
    return json.dumps({'success' : False, 'error' : 'server', 'error_msg' : tb_str})

app = Flask('vinum')
app.handle_exception = general_error_handler
app.debug = True

try:
    import client
    import produit
    import inventaire
except:
    pass
