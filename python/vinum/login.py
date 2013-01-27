from vinum import *
from flask.ext.login import LoginManager, login_required, login_user, logout_user, UserMixin
import little_pger as pg


login_manager = LoginManager()
login_manager.init_app(app)


class User(UserMixin):
    def __init__(self, u):
        self.id = u['usager_id']
        self.name = u['usager_nom']


@login_manager.user_loader
def load_user(id):
    u = pg.select1r(g.db.cursor(), 'usager', where={'usager_id': id})
    if u: return User(u)
    return None


@app.route("/check_login", methods=['POST'])
@login_required
def check_login():
    # all the @login_required decorated views emit 401 if authentication fails
    # (so this one, by doing nothing, is basically just an authentication checker,
    #  used when the webapp first loads, to pop a login dialog if needed)
    return {'success': True}


@app.route("/login", methods=['POST'])
def login():
    un = request.form["username"]
    pw = request.form["password"]
    u = pg.select1r(g.db.cursor(), 'usager', where={'usager_nom': un})
    if u:
        u = pg.select1r(g.db.cursor(), 'usager',
                        what=["mdp_hash = (select crypt('%s', mdp_hash)) is_pw_ok" % pw,
                              'usager.*'], where={'usager_nom': un})
        if u['is_pw_ok']:
            login_user(User(u), remember=('remember' in request.form))
            return {'success': True}
        else:
            return {'success': False, 'error': 'password'}
    # in principle it's not a good practice to reveal the login error (pw/user),
    # but.. as it's definitely more user-friendly, let's do it anyway!
    return {'success': False, 'error': 'username'}


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return {'success': True}
