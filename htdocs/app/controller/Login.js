Ext.define('VIN.controller.Login', {

    extend: 'Ext.app.Controller',

    init: function() {

        var attemptLogin = function(widget) {
            var win = widget.up('#login_w');
            var form = win.down('#login_f');
            if (!form.getForm().isValid()) { return; }
            form.submit({
                url: ajax_url_prefix + '/login',
                success: function(_form, action) {
                    win.hide();
                    win.successful_login_callback();
                    win.successful_login_callback = Ext.emptyFn;
                },
                failure: function(_form, action) {
                    if (action.result.error === 'username') {
                        form.down('#username_tf').markInvalid("Ce nom d'usager n'est pas valide");
                    } else if (action.result.error === 'password') {
                        form.down('#password_tf').markInvalid("Ce mot de passe n'est pas valide");
                    }
                }
            });
        };

        this.control({

            '#login_btn': {
                click: function(btn) {
                    attemptLogin(btn);
                }
            },

            '#login_f textfield': {
                specialkey: function(tf, e, eOpts) {
                    if (e.getKey() === e.ENTER) {
                        attemptLogin(tf);
                    }
                }
            }

        });

    }

});
