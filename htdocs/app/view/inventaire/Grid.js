Ext.define('VIN.view.inventaire.Grid', {

    extend: 'Ext.grid.Panel',
    alias: 'widget.inventaire_grid',
    requires: ['Ext.ux.grid.FiltersFeature'],
    title: 'Inventaire',
    closable: true,
    column_flex: 'all',
    use_paging_toolbar: true,

    initComponent: function() {

        if (!this.store) {
            this.store = Ext.create('VIN.store.Inventaires');
        }

        this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

        if (this.use_paging_toolbar) {
            this.dockedItems = {
                xtype: 'pagingtoolbar',
                dock: 'bottom',
                store: this.store,
                displayInfo: true
            };
        }

        this.callParent(arguments);

    },

    // viewConfig: {
    //     preserveScrollOnRefresh: true
    // },

    features: [{
        ftype: 'filters',
        encode: true,
        local: false
    }]

});
