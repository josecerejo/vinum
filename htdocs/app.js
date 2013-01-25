Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux': './extjs/examples/ux'
    }
});

var ajax_url_prefix = '/vinum_server'; // should correspond to WSGIScriptAlias
var use_flask_server = window.location.port !== '';
var initial_tab = null; //'widget.inventaire_grid';
var last_update = '2013-01-22';
var vinum_version = 'prototype';

Ext.window.MessageBox.prototype.buttonText = {
    cancel: 'Annuler',
    yes: 'Oui',
    no: 'Non',
    ok: 'Ok'
};

Ext.form.field.Text.prototype.blankText = 'Ce champ est requis';

Ext.form.field.Date.prototype.format = 'Y-m-d';
Ext.grid.column.Date.prototype.format = 'Y-m-d';
Ext.form.field.Date.prototype.altFormats = 'Y-m-d H:i:s';
Ext.grid.column.Date.prototype.altFormats = 'Y-m-d H:i:s';

// disable numberfields up/down arrows
Ext.form.field.Number.prototype.hideTrigger = true;

// right align for numeric grid columns
Ext.grid.column.Number.prototype.align = 'right';

Ext.override(Ext.data.proxy.Ajax, {
    listeners: {
        exception: function (proxy, response, operation, options) {

            if (response.status = 401) {
                login_win.show();
                return;
            }

            if (use_flask_server) {
                VIN.utils.createFlaskDebugConsoleWindow(response.responseText);
            } else {
                VIN.utils.serverErrorPopup(Ext.JSON.decode(response.responseText).error_msg);
            }
        }
    }
});

// Ext.Ajax.on('requestcomplete', function(conn, response, opts, eopts) {
//     if (use_flask_server) { return; }
//     var r = Ext.JSON.decode(response.responseText);
//     if (!r.success) {
//         VIN.utils.serverErrorPopup(r.error_msg);
//     }
// });

// Ext.Ajax.on('requestexception', function(conn, response, opts, eopts) {
//     if (use_flask_server) {
//         VIN.utils.createFlaskDebugConsoleWindow(response.responseText);
//     } else {
//         var r = Ext.JSON.decode(response.responseText);
//         VIN.utils.serverErrorPopup(r.error_msg);
//     }
// });

Ext.override(Ext.form.action.Submit, {
    failure: function(form, action) {
        if (use_flask_server) {
            VIN.utils.createFlaskDebugConsoleWindow(action.response.responseText);
        } else {
            VIN.utils.serverErrorPopup(action.result.error_msg);
        }
    }
});

Ext.override(Ext.form.action.Load, {
    failure: function(form, action) {
        if (use_flask_server) {
            VIN.utils.createFlaskDebugConsoleWindow(action.response.responseText);
        } else {
            VIN.utils.serverErrorPopup(action.result.error_msg);
        }
    }
});

Ext.application({
    name: 'VIN',
    controllers: ['MainToolbar', 'Client', 'Commande', 'Inventaire', 'ProduitEtProducteur'],
    autoCreateViewport: true,
    launch: function() {
        VIN.app = this; // to access the controllers with VIN.app.getController
        // global!
        wait_mask = new Ext.LoadMask(Ext.getBody(), {msg:"Un moment svp..."});

        successful_login_callback = Ext.emptyFn;
        login_win = Ext.create('Ext.window.Window', {
            title: 'Bienvenue à Vinum!',
            itemId: 'login_w',
            modal: true,
            layout: 'fit',
            closeAction: 'hide',
            closable: false,
            successful_login_callback: Ext.emptyFn,
            items: {
                xtype: 'form',
                bodyStyle: 'background-color:#dfe8f5',
                border: 0,
                itemId: 'login_f',
                padding: 10,
                fieldDefaults: {
                    anchor: '100%'
                },
                layout: {
                    type: 'vbox',
                    align: 'stretch'  // Child items are stretched to full width
                },
                items: [{
                    xtype: 'textfield',
                    fieldLabel: 'Nom',
                    name: 'username',
                    itemId: 'username_tf',
                    allowBlank: false
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Mot de passe',
                    name: 'password',
                    itemId: 'password_tf',
                    inputType: 'password',
                    allowBlank: false
                }]
            },
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                ui: 'footer',
                layout: {
                    pack: 'center'
                },
                items: [{
                    text: 'Se connecter',
                    itemId: 'login_btn',
                    listeners: {
                        click: function(btn) {
                            var win = btn.up('#login_w');
                            var form = win.down('#login_f');
                            if (!form.getForm().isValid()) { return; }
                            form.submit({
                                url: ajax_url_prefix + '/login',
                                success: function(_form, action) {
                                    win.hide();
                                    successful_login_callback();
                                    successful_login_callback = Ext.emptyFn;
                                },
                                failure: function(_form, action) {
                                    if (action.result.error === 'username') {
                                        form.down('#username_tf').markInvalid("Ce nom d'usager n'est pas valide");
                                    } else if (action.result.error === 'password') {
                                        form.down('#password_tf').markInvalid("Ce mot de passe n'est pas valide");
                                    }
                                }
                            });
                        }
                    }
                }]
            }]
        });

        Ext.Ajax.request({
            url: ajax_url_prefix + '/login_check',
            method: 'POST',
            failure: function() {
                login_win.show();
            }
        });

    }
});
