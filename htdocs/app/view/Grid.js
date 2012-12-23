Ext.define('VIN.view.Grid', {

    extend: 'Ext.grid.Panel',
    alias: 'widget.vin_grid',
    requires: ['Ext.ux.grid.FiltersFeature'],
    column_flex: 'all',

    initComponent: function() {

        if (!this.columns) {
            this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);
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

        this.callParent(arguments);
    }

});

