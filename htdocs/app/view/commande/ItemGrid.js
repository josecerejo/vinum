Ext.define('VIN.view.commande.ItemGrid', {

    extend: 'VIN.view.Grid',
    alias: 'widget.commande_item_grid',
    requires: ['Ext.ux.grid.RowActions'],
    is_editable: true,

    initComponent: function() {

        // this.store.groupField must be set!
        this.features = [Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: '{name}',
            hideGroupedHeader: true
        })];

        this.columns = VIN.view.Grid.getColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

        if (this.is_editable) {

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

            Ext.each(this.columns, function(col) {
                if (col.dataIndex == 'commission') {
                    col.editor = {
                        xtype: 'combo',
                        queryMode: 'local',
                        triggerAction: 'all',
                        displayField: 'commission',
                        valueField: 'commission',
                        forceSelection: false,
                        allowBlank: false,
                        regex: /^0\.[0-9]+$/,
                        regexText: 'La commission doit être une valeur entre 0 et 1 (ex. 0.23)',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['commission'],
                            data: [{commission: 0.16},
                                   {commission: 0.23}]
                        })
                    };
                    return;
                }
            });
        }

        this.plugins = [Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        })];

        this.callParent(arguments);
    }

});
