Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux': './extjs/examples/ux'
    }
});

var ajax_url_prefix = '/vinum_server'; // should correspond to WSGIScriptAlias
var use_flask_server = window.location.port !== '';
var initial_tab = null; //'widget.inventaire_grid';
var last_update = '2013-04-16';
var vinum_version = 'alpha';
var dev_msg = '<b>Dernières mises à jour:</b>' +
    "<br>&bull; Bug fenêtre de courriel" +
    "<br>&bull; Millésime dans l'inventaire";

if (window.location.href.indexOf('localhost') !== -1) { document.title = 'Vinum (local)'; }

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

// idea taken from: http://www.sencha.com/forum/showthread.php?147882-Get-store-from-proxy&p=721344&viewfull=1#post721344
Ext.override(Ext.data.Store, {
    constructor: function(config) {
        this.callParent([config]);
        this.proxy.on('exception', this.onProxyException, this);
    },
    onProxyException: function(proxy, response, options, eOpts) {
        if (response.status === 401) {
            var store = this;
            login_win.pop(function() {
                store.load();
            });
        } else {
            if (use_flask_server) {
                VIN.utils.createFlaskDebugConsoleWindow(response.responseText);
            } else {
                VIN.utils.serverErrorPopup(Ext.JSON.decode(response.responseText).error_msg);
            }
        }
    }
});

Ext.override(Ext.form.action.Submit, {
    failure: function(form, action) {
        if (action.response.status === 401) {
            login_win.pop(function() {
                action.run();
            });
        } else {
            if (use_flask_server) {
                VIN.utils.createFlaskDebugConsoleWindow(action.response.responseText);
            } else {
                VIN.utils.serverErrorPopup(action.result.error_msg);
            }
        }
    }
});

Ext.override(Ext.form.action.Load, {
    failure: function(form, action) {
        if (action.response.status === 401) {
            login_win.pop(function() {
                action.run();
            });
        } else {
            if (use_flask_server) {
                VIN.utils.createFlaskDebugConsoleWindow(action.response.responseText);
            } else {
                VIN.utils.serverErrorPopup(action.result.error_msg);
            }
        }
    }
});

// numberfield with forced 2 decimal precision (for prices)
// based on that idea: http://stackoverflow.com/a/13736243/787842
Ext.define('VIN.field.PriceField', {
    extend: Ext.form.NumberField,
    alias: 'widget.pricefield',
    valueToRaw: function(value) {
        var me = this,
        decimalSeparator = me.decimalSeparator;
        value = me.parseValue(value);
        value = me.fixPrecision(value);
        value = Ext.isNumber(value) ? value : parseFloat(String(value).replace(decimalSeparator, '.'));
        if (isNaN(value)) {
            value = '';
        } else {
            value = value.toFixed(me.decimalPrecision);
            value = String(value).replace(".", decimalSeparator);
        }
        return value;
    }
});

Ext.application({
    name: 'VIN',
    controllers: ['MainToolbar', 'Client', 'Commande', 'Inventaire', 'ProduitEtProducteur',
                  'Login', 'Rapport', 'Backorder', 'Succursale'],
    autoCreateViewport: true,
    launch: function() {

        VIN.app = this; // to access the controllers with VIN.app.getController

        // globals!
        wait_mask = new Ext.LoadMask(Ext.getBody(), {msg:"Un moment svp..."});
        login_win = Ext.create('VIN.view.LoginWindow');
        backorder_win = Ext.create('VIN.view.BackorderWindow');

        // FF doesn't render the login_name td correctly without this:
        jQuery('#main_header').width($(document).width() - 20); // padding=10+10
        jQuery('#dev_msg').html(dev_msg);

        // initial login check (needed because the app doesn't interact with the server when it starts up)
        Ext.Ajax.request({
            url: ajax_url_prefix + '/check_login',
            method: 'POST',
            failure: function() {
                login_win.pop();
            },
            success: function(resp) {
                VIN.app.getController('Login').setUserPrivileges(Ext.JSON.decode(resp.responseText));
            }
        });

    }
});
