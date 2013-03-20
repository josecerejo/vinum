Ext.define('VIN.view.LoginWindow', {

    extend: 'Ext.window.Window',

    title: 'Vinum',
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
        }, {
            xtype: 'checkbox',
            boxLabel: 'Rester connecté (entre les sessions)',
            checked: true,
            name: 'remember'
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
            text: 'Connexion',
            iconCls: 'connect-icon',
            itemId: 'login_btn'
        }]
    }],
    pop: function(callback) {
        // I'm not sure if this might be annoying or not.. more secure though
        this.down('#login_f').getForm().reset();
        this.show();
        this.successful_login_callback = Ext.emptyFn;
        if (typeof callback === 'function') {
            this.successful_login_callback = callback;
        }
    }

});
