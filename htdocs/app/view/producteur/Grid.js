Ext.define('VIN.view.producteur.Grid', {

    extend: 'Ext.grid.Panel',
    alias: 'widget.producteur_grid',
    requires: ['Ext.ux.grid.FiltersFeature'],
    column_flex: 'all',

    initComponent: function() {

        if (!this.store) {
            this.store = Ext.create('VIN.store.Producteurs');
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
