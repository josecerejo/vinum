Ext.define('VIN.view.client.Grid', {

    extend: 'Ext.grid.Panel',
    alias: 'widget.client_grid',
    title: 'Clients',
    closable: true,
    requires: ['Ext.ux.grid.FiltersFeature'],
    column_flex: {
        no_client: 0.1,
        no_client_saq: 0.1,
        nom_social: 0.7,
        date_ouverture_dossier: 0.1
    },

    initComponent: function() {

        this.store = Ext.create('VIN.store.Clients');

        this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

        this.dockedItems = {
            xtype: 'pagingtoolbar',
            store: this.store,
            dock: 'bottom',
            displayInfo: true
        };

        this.columns.push({
            xtype: 'actioncolumn',
            width: 30,
            sortable: false,
            items: [{
                icon: 'resources/images/icons/application_form_edit.png',
                tooltip: 'Détails du client',
                handler: function(grid, rowIndex, colIndex, node, e, record, rowNode) {
                    this.fireEvent('edit_click', grid, rowIndex, colIndex, node, e, record, rowNode);
                }
            }]
        });

        this.columns.push({
            xtype: 'actioncolumn',
            width: 30,
            sortable: false,
            items: [{
                icon: 'resources/images/icons/delete.png',
                tooltip: 'Enlever ce client de la base de données',
                handler: function(grid, rowIndex, colIndex, node, e, record, rowNode) {
                    this.fireEvent('del_click', grid, rowIndex, colIndex, node, e, record, rowNode);
                }
            }]
        });

        this.features = [{
            ftype: 'filters',
            encode: true,
            local: false
        }];

        // this.viewConfig = {
        //     preserveScrollOnRefresh: true
        // };

        this.callParent(arguments);
    }

});
