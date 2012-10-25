Ext.define('VIN.view.commande.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.commande_grid',
    column_flex: {
    },

    initComponent: function() {
        
        if (!this.store) {
            this.store = Ext.create('VIN.store.Commandes');
        } 

        this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

        this.dockedItems = [{
            xtype: 'toolbar',
            items: [{
                iconCls: 'cancel-icon',
                text: 'Tout supprimer'
            }]
        }];

        // for (var i = 0; i < this.columns.length; i++) {
        //     if (this.columns[i].dataIndex == 'quantite_caisse') {
        //         this.columns[i].editor = {
        //             xtype: 'numberfield',
        //             allowBlank: false,
        //             minValue: 1
        //         };
        //     }
        // }

        // this.columns.push({
        //     xtype: 'actioncolumn',
        //     width: 30,
        //     sortable: false,
        //     items: [{
        //         icon: 'resources/images/icons/delete.png',
        //         tooltip: 'Enlever de la commande'
        //     }]
        // });

        // this.plugins = [Ext.create('Ext.grid.plugin.CellEditing', {
        //     clicksToEdit: 1
        // })];

        this.callParent(arguments);
    },

    viewConfig: {
        preserveScrollOnRefresh: true
    }

});
