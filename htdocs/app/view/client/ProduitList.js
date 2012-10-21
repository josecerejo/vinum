Ext.define('VIN.view.client.ProduitList', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.client_produit_grid',
    requires: ['Ext.ux.grid.FiltersFeature'],
    column_flex: {
    },

    initComponent: function() {
        
        if (!this.store) {
            this.store = Ext.create('VIN.store.Produits');
        } 

        this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

        this.columns.splice(0, 0, {
            xtype: 'actioncolumn',
            width: 30,
            sortable: false,
            items: [{
                icon: 'resources/images/icons/delete.png',
                tooltip: 'Enlever ce produit de la liste'
            }]
        });

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
