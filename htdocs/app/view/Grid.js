Ext.define('VIN.view.Grid', {

    extend: 'Ext.grid.Panel',
    alias: 'widget.vin_grid',
    requires: ['Ext.ux.grid.FiltersFeature'],
    add_edit_actioncolumn: false,
    add_delete_actioncolumn: false,
    column_flex: 'all',
    load_after_render: true,

    initComponent: function() {

        if (!this.columns) {
            this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);
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
            text: 'aucun item'
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
    }

});

