Ext.Loader.setConfig({enabled:true});
Ext.Loader.setPath('Ext.ux', './extjs/examples/ux');
Ext.Date.defaultFormat = 'Y-m-d';

var use_login = (window.location.hostname != 'localhost');

Ext.window.MessageBox.prototype.buttonText = {
    cancel: 'Annuler',
    yes: 'Oui',
    no: 'Non'
};

Ext.application({

    name: 'VIN',

    controllers: ['MainToolbar', 'Client', 'Commande'],

    autoCreateViewport: true,

    launch: function() {
        if (use_login) {
            var msg_box = new Ext.window.MessageBox();
            msg_box.textField.inputType = 'password';
            var popLogin = function() {                
                msg_box.show({		                        
                    title: 'Bienvenue à Vinum!',
                    msg: 'Votre mot de passe:',
                    buttons: Ext.MessageBox.OK,
                    prompt: true,
                    icon: Ext.MessageBox.QUESTION,
                    closable: false,
                    fn: function(btn, text) {
                        if (text != '!!rouc.com99') {
                            Ext.Msg.show({
                                title: 'Vinum', 
                                msg: 'Mot de passe inconnu...',
                                icon: Ext.MessageBox.ERROR,
                                buttons: Ext.MessageBox.OK,
                                fn: function() {
                                    popLogin();
                                }
                            });
                        } else {
                            //Ext.create('VIN.view.Viewport');
                        }
                    }
                });
            };
            popLogin();
        } else {
            //Ext.create('VIN.view.Viewport');
        }
    }
});
