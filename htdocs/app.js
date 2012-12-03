Ext.Loader.setConfig({enabled:true});
Ext.Loader.setPath('Ext.ux', './extjs/examples/ux');

var ajax_url_prefix = '/vinum_server'; // should correspond to WSGIScriptAlias
var use_flask_server = false;
var initial_tab = 'widget.client_form';

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

Ext.override(Ext.data.proxy.Ajax, {
    listeners: {
        exception: function (thisProxy, response, operation, eventOpts) {
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
    controllers: ['MainToolbar', 'Client', 'Commande'],
    autoCreateViewport: true,
    launch: function() {
        // global!
        VIN.app = this;
        wait_mask = new Ext.LoadMask(Ext.getBody(), {msg:"Un moment svp..."});
    }
});
