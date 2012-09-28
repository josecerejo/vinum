Ext.define('VIN.view.inventaire.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.inventaire_grid',
    requires: ['Ext.ux.grid.FiltersFeature'],
    column_flex: {
    },

    initComponent: function() {
        
        if (!this.store) {
            this.store = Ext.create('VIN.store.Inventaire');
        } 

        // this.dockedItems = {
        //     xtype: 'pagingtoolbar',
        //     store: this.store,
        //     dock: 'bottom',
        //     displayInfo: true
        // };
        
        this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

        this.columns.push({
            xtype: 'actioncolumn',
            width: 30,
            sortable: false,
            items: [{
                icon: 'resources/images/icons/add.png',
                tooltip: 'Ajouter à la commande'
            }]
        });

        this.plugins = [Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        })];

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
