Ext.define('VIN.view.commande.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.commande_grid',
    requires: ['Ext.ux.grid.RowActions'],
    column_flex: {
    },

    initComponent: function() {
        
        if (!this.store) {
            this.store = Ext.create('VIN.store.Commandes');
        } 

        // this.store.groupField must be set!
        this.features = [Ext.create('Ext.grid.feature.Grouping',{
            groupHeaderTpl: '{name}',
            hideGroupedHeader: true
        })];

        this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

        this.columns.push({
            xtype: 'rowactions',
            actions: [],
            keepSelection: true,
            groupActions: { 
    	    	iconCls: 'del-icon', 
    	    	qtip: 'Supprimer ce produit de la commande', 
    	    	align: 'left', 
                callback: Ext.emptyFn
    	    }
        });

        this.callParent(arguments);
    },

    viewConfig: {
        preserveScrollOnRefresh: true
    }

});
