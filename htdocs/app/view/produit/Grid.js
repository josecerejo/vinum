Ext.define('VIN.view.produit.Grid', {

    extend: 'Ext.grid.Panel',
    alias: 'widget.produit_grid',
    requires: ['Ext.ux.grid.FiltersFeature'],
    //autoLoad: true,
    column_flex: 'all',

    initComponent: function() {

        if (!this.store) {
            this.store = Ext.create('VIN.store.Produits');
        }

        this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

        this.callParent(arguments);

    },

    features: [{
        ftype: 'filters',
        encode: true,
        local: false
    }]

});
