import os
from werkzeug.wsgi import SharedDataMiddleware
from vinum import app

if __name__ == '__main__':

    delattr(app, 'handle_exception') # app.handle_exception is set in __init__.py to a general handler returning nice 
                                     # json error messages, for when we're running in production mod_wsgi mode

    # http://flask.pocoo.org/snippets/84/
    # To allow using "/vinum_server" prefixed URLs (i.e. WSGIScriptAlias) in the Flask server env
    class CherrokeeFix(object):

        def __init__(self, app, script_name):
            self.app = app
            self.script_name = script_name

        def __call__(self, environ, start_response):
            path = environ.get('SCRIPT_NAME', '') + environ.get('PATH_INFO', '')
            environ['SCRIPT_NAME'] = self.script_name
            environ['PATH_INFO'] = path[len(self.script_name):]
            assert path[:len(self.script_name)] == self.script_name
            return self.app(environ, start_response)

    # this produces the strange caching bug, i.e. wrong style.css file sent
    # app.wsgi_app = CherrokeeFix(app.wsgi_app, '/vinum_server')
    # app.run(debug=True, port=80, static_files={'/vinum': '/home/christian/vinum/htdocs'})

    app.wsgi_app = SharedDataMiddleware(CherrokeeFix(app.wsgi_app, '/vinum_server'),
                                        {'/vinum': '/home/christian/vinum/htdocs'})
    app.run(debug=True, port=81)
