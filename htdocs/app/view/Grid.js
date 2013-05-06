Ext.define('VIN.view.Grid', {

    extend: 'Ext.grid.Panel',
    alias: 'widget.vin_grid',
    requires: ['Ext.ux.grid.FiltersFeature', 'Ext.ux.CheckColumn'],
    add_edit_actioncolumn: false,
    add_delete_actioncolumn: false,
    column_flex: 'all',
    load_after_render: true,

    initComponent: function() {

        if (!this.columns) {
            this.columns = VIN.view.Grid.getColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);
        }

        if (this.add_edit_actioncolumn) {
            this.columns.push({
                xtype: 'actioncolumn',
                width: 30,
                sortable: false,
                items: [{
                    icon: 'resources/images/icons/application_form_edit.png',
                    tooltip: 'Détails',
                    handler: function(grid, rowIndex, colIndex, node, e, record, rowNode) {
                        this.fireEvent('edit_click', grid, rowIndex, colIndex, node, e, record, rowNode);
                    }
                }]
            });
        }

        if (this.add_delete_actioncolumn) {
            this.columns.push({
                xtype: 'actioncolumn',
                width: 30,
                sortable: false,
                items: [{
                    icon: 'resources/images/icons/delete.png',
                    tooltip: 'Enlever cet item de la base de données',
                    handler: function(grid, rowIndex, colIndex, node, e, record, rowNode) {
                        this.fireEvent('del_click', grid, rowIndex, colIndex, node, e, record, rowNode);
                    }
                }]
            });
        }

        if (!this.features) {
            this.features = [];
        }
        this.features.push({
            ftype: 'filters',
            encode: true,
            local: false
        });

        this.bbar = Ext.create('Ext.ux.statusbar.StatusBar', {
            statusAlign: 'right',
            text: 'aucun item',
            items: {
                icon: 'extjs/resources/themes/images/default/grid/refresh.gif',
                listeners: {
                    click: function(btn) {
                        btn.up('grid').getStore().reload();
                    }
                }
            }
        });

        var bbar = this.bbar; // not sure why this.bbar is not accessible below, even though I use Ext.bind!

        this.getStore().on('load', Ext.bind(function(store, recs) {
            bbar.setText(Ext.String.format('{0} items', store.getTotalCount()));
        }, this));

        this.listeners = {
            // must create the filters after grid is rendered
            // for the filters default value to be set; loading must follow, not precede
            afterrender: function(grid) {
                grid.filters.createFilters();
                // HACK!! this is to counter a problem I noticed with grid filters used
                // with external/docked widgets: they seem to only work the second time they're (any filter actually)
                // used (for textfields I took a long time to notice since it's rare that a single
                // char filter is used; for other types like combo for instance, the problem is more
                // apparent; so what this does is simply to set an empty filter on the first string/auto
                // filter found in the grid, so that the first time the user use ANY filter, it's actually the second!
                // for (var i = 0; i < grid.columns.length; i++) {
                //     var filter = grid.filters.getFilter(grid.columns[i].dataIndex);
                //     if (filter && filter.type === 'auto') {
                //         filter.setValue('');
                //         filter.setActive(true);
                //         break;
                //     }
                // }
                if (this.load_after_render) {
                    grid.getStore().load();
                }
            }
        };

        this.callParent(arguments);
    },

    statics: {

        getColumnsFromModel: function(model, column_flex) {
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
                if (item.hasOwnProperty('tdCls')) {
                    col.tdCls = item.tdCls;
                }
                if (item.hasOwnProperty('filter')) {
                    col.filter = item.filter;
                }
                if (item.hasOwnProperty('align')) {
                    col.align = item.align;
                }
                if (item.hasOwnProperty('editor')) {
                    col.editor = item.editor;
                }
                if (item.type.type == 'date') {
                    col.xtype = 'datecolumn';
                    col.align = 'center';
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

