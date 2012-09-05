Ext.Loader.setConfig({enabled:true});
Ext.Loader.setPath('Ext.ux', './extjs/examples/ux');

var use_login = false;

Ext.application({

    name: 'VIN',

    controllers: ['LeftNav', 'Client'],

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
                        //if (text != '!!rouc.com99') {
                        if (text != 'x') {
                            Ext.Msg.show({
                                title: 'Erreur', 
                                msg: 'Mot de passe inconnu...',
                                icon: Ext.MessageBox.ERROR,
                                buttons: Ext.MessageBox.OK,
                                fn: function() {
                                    popLogin();
                                }
                            });
                        } else {
                            Ext.create('VIN.view.Viewport');
                        }
                    }
                });
            };
            popLogin();
        } else {
            Ext.create('VIN.view.Viewport');
        }
    }
});

