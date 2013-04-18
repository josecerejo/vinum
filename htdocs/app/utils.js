Ext.define('VIN.utils', {

    requires: ['Ext.ux.CheckColumn'],

    statics: {

        serverErrorPopup: function(msg) {
            wait_mask.hide();
            //var msg = "<b>SVP veuillez copier le message d'erreur suivant et l'envoyer à cjauvin@gmail.com</b>:<br /><br />";
            Ext.Msg.show({
                title: 'Erreur du serveur',
                //msg: msg + server_error_msg,
                msg: msg,
                icon: Ext.MessageBox.ERROR,
                buttons: Ext.MessageBox.OK
            });
        },

        // flag preventing the "piling on" of flask debug consoles
        is_flask_debug_console_in_use: false,

        createFlaskDebugConsoleWindow: function(html) {
            if (this.is_flask_debug_console_in_use) { return; }
            this.is_flask_debug_console_in_use = true;
            wait_mask.hide();
            var div = document.createElement('div');
            div.id = 'flask_debug_console_div';
            document.body.appendChild(div);
            Ext.create('Ext.window.Window', {
                title: 'Flask Debug Console',
                width: 800,
                height: 600,
                layout: 'fit',
                contentEl: div.id,
                autoScroll: true,
                listeners: {
                    close: Ext.bind(function() {
                        this.is_flask_debug_console_in_use = false;
                    }, this)
                }
            }).show();
            $(div).html(html);
        }

    }
});
