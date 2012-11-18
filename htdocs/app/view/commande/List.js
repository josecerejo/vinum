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

        for (var i = 0; i < this.columns.length; i++) {
            if (this.columns[i].dataIndex == 'commission') {
                this.columns[i].editor = {
                    xtype: 'combo',
                    queryMode: 'local',
                    triggerAction: 'all',
                    displayField: 'commission',
                    valueField: 'commission',
                    forceSelection: false,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['commission'],
                        data: [{commission: 0.16},
                               {commission: 0.23}]
                    })
                };
            }
        }

        this.plugins = [Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        })];

        this.callParent(arguments);
    },

    viewConfig: {
        preserveScrollOnRefresh: true
    }

});
