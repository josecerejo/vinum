Ext.define('VIN.utils', {

    requires: ['Ext.ux.CheckColumn'],

    statics: {

        serverErrorPopup: function(server_error_msg) {
            wait_mask.hide();
            var msg = "<b>SVP veuillez copier le message d'erreur suivant et l'envoyer à cjauvin@gmail.com</b>:<br /><br />";
            Ext.Msg.show({
                title: 'Erreur du serveur',
                msg: msg + server_error_msg,
                icon: Ext.MessageBox.ERROR,
                buttons: Ext.MessageBox.OK
            });
        },

        createFlaskDebugConsoleWindow: function(html) {
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
                autoScroll: true
            }).show();
            $(div).html(html);
        },

        getGridColumnsFromModel: function(model, column_flex) {
            var cols = [];
            var items = model.prototype.fields.items;
            for (var i = 0; i < items.length; i++) {
                var name = items[i].name;
                if (column_flex == 'all') {
                    flex = 1;
                    hidden = false;
                } else {
                    flex = column_flex.hasOwnProperty(name) ? column_flex[name] : 0;
                    hidden = !column_flex.hasOwnProperty(name);
                }
                var col = {
                    xtype: 'gridcolumn',
                    text: items[i].hasOwnProperty('header') ? items[i].header : Ext.String.capitalize(items[i].name),
                    dataIndex: name,
                    type: items[i].type.type,
                    filterable: true,
                    flex: flex,
                    hidden: hidden
                };
                if (items[i].hasOwnProperty('filter')) {
                    col.filter = items[i].filter;
                }
                if (items[i].type.type == 'date') {
                    col.xtype = 'datecolumn';
                } else if (items[i].type.type == 'float') {
                    col.xtype = 'numbercolumn'; // to fix formatting issue
                    col.useNull = false;
                } else if (items[i].type.type == 'int') {
                    col.useNull = false;
                } else if (items[i].type.type == 'bool') {
                    col.xtype = 'checkcolumn';
                    col.processEvent = function() {
                        return false;
                    }
                }
                cols.push(col);
            }
            return cols;
        }

    }
});
