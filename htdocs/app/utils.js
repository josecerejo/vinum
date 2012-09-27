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
        },

        getGridColumnsFromModel: function(model, column_flex) {
            var cols = [];
            var items = model.prototype.fields.items;
            for (var i = 0; i < items.length; i++) {
                var name = items[i].name;
                var col = {
                    header: items[i].header,
                    dataIndex: name,
                    type: items[i].type.type,
                    filterable: true,
                    flex: column_flex.hasOwnProperty(name) ? column_flex[name] : 0,
                    hidden: !column_flex.hasOwnProperty(name)
                };
                if (items[i].type.type == 'date') {
                    col.renderer = Ext.util.Format.dateRenderer('Y-m-d');
                }
                cols.push(col);
            }
            return cols;
        }

    }
});
