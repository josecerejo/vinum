Ext.define('VIN.view.client.Grid', {

    extend: 'VIN.view.Grid',
    alias: 'widget.client_grid',
    title: 'Clients',
    closable: true,

    initComponent: function() {

        this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

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

        this.callParent(arguments);
    }

});
