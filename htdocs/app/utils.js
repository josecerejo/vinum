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
        },

        getGridColumnsFromModel: function(model, column_flex) {
            var cols = [];
            var items = model.prototype.fields.items;
            Ext.each(items, function(item) {
                var name = item.name;
                var flex = 1;
                var hidden = false;
                var filterable = true;
                if (column_flex != 'all') {
                    flex = column_flex.hasOwnProperty(name) ? column_flex[name] : 0;
                    hidden = !column_flex.hasOwnProperty(name);
                    filterable = item.hasOwnProperty('filterable') ? item.filterable : true;
                }
                var col = {
                    xtype: 'gridcolumn',
                    text: item.hasOwnProperty('header') ? item.header : Ext.String.capitalize(item.name),
                    dataIndex: name,
                    type: item.type.type,
                    filterable: filterable,
                    flex: flex,
                    hidden: hidden
                };
                if (item.hasOwnProperty('filter')) {
                    col.filter = item.filter;
                }
                if (item.hasOwnProperty('align')) {
                    col.align = item.align;
                }
                if (item.type.type == 'date') {
                    col.xtype = 'datecolumn';
                } else if (item.type.type == 'float' || item.type.type == 'int') {
                    col.xtype = 'numbercolumn'; // to fix formatting issue
                    if (item.type.type == 'int') {
                        col.format = '0';
                    }
                } else if (item.type.type == 'bool') {
                    col.xtype = 'checkcolumn';
                    col.processEvent = function() {
                        return false;
                    }
                }
                cols.push(col);
            });
            return cols;
        }

    }
});
