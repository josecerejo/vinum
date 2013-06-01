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
                if (this.load_after_render) {
                    grid.getStore().load();
                }
            }
        };

        this.callParent(arguments);
    },

    statics: {

        getColumnsFromModel: function(model, column_flex) {
            // if column_flex is an array, only the column whose names are found in it will be
            // used, and moreover, in the given order; the following structure is expected:
            // [[col1_name, flex_value], [col2_name, flex_value], ..]
            if (jQuery.isArray(column_flex)) {
                var items = [];
                var column_flex_obj = {};
                Ext.each(column_flex, function(cf_item) {
                    // really not efficient..!
                    Ext.each(model.prototype.fields.items, function(model_item) {
                        if (model_item.name === cf_item[0]) {
                            items.push(model_item);
                            column_flex_obj[model_item.name] = cf_item[1];
                            return false;
                        }
                    });
                });
                column_flex = column_flex_obj;
            } else {
                // if it's an object (or 'all'), then the columns will be visited in the order they
                // were defined in the corresponding Model (with their visibility and flex values modified on
                // the fly with the column_flex struct)
                var items = model.prototype.fields.items;
            }
            var cols = [];
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
        },

        applyExternalGridFilter: function(grid, field, filter_name) {
            var filter = grid.filters.getFilter(filter_name);
            var value = field.getValue();
            filter.setValue(value);
            if (value) {
                // must apply filter twice (bug):
                // http://stackoverflow.com/questions/9629531/apply-grid-filter-programmatically-from-function
                filter = grid.filters.getFilter(filter_name);
                filter.setValue(value);
                filter.setActive(true);
            } else {
                filter.setActive(false);
            }
        }

    }

});

