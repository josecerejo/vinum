Ext.define('VIN.utils', {
    statics: {
        serverErrorPopup: function(server_error_msg) {
            var msg = "<b>SVP veuillez copier le message d'erreur suivant et l'envoyer à cjauvin@gmail.com</b>:<br /><br />";
            Ext.Msg.show({
                title: 'Erreur du serveur', 
                msg: msg + server_error_msg,
                icon: Ext.MessageBox.ERROR,
                buttons: Ext.MessageBox.OK
            });        
        }
    }
});
