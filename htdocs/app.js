Ext.Loader.setConfig({enabled:true});
Ext.Loader.setPath('Ext.ux', './extjs/examples/ux');
Ext.Date.defaultFormat = 'Y-m-d';

var ajax_url_prefix = '/vinum_server'; // should correspond to WSGIScriptAlias
var use_flask_server = false;

Ext.window.MessageBox.prototype.buttonText = {
    cancel: 'Annuler',
    yes: 'Oui',
    no: 'Non',
    ok: 'Ok'
};

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

Ext.application({
    name: 'VIN',
    controllers: ['MainToolbar', 'Client', 'Commande'],
    autoCreateViewport: true,
    launch: function() {
        // global!
        wait_mask = new Ext.LoadMask(Ext.getBody(), {msg:"Envoi du message..."});
    }
});
