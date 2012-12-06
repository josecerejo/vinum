Ext.define('VIN.view.commande.Grid', {

    extend: 'Ext.grid.Panel',
    alias: 'widget.commande_grid',
    requires: ['Ext.ux.grid.RowActions'],
    column_flex: {
    },

    initComponent: function() {
        
        if (!this.store) {
            this.store = Ext.create('VIN.store.Commandes');
        } 

        this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

        this.dockedItems = {
            xtype: 'pagingtoolbar',
            dock: 'bottom',
            store: this.store,
            displayInfo: true
        };

        this.callParent(arguments);
    },

    viewConfig: {
        preserveScrollOnRefresh: true
    },
    features: [{
        ftype: 'filters',
        encode: true,
        local: false
    }]

});
