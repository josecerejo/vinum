Ext.define('VIN.view.client.ProduitGrid', {

    extend: 'VIN.view.Grid',
    alias: 'widget.client_produit_grid',

    initComponent: function() {

        this.columns = VIN.view.Grid.getColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

        this.columns.splice(0, 0, {
            xtype: 'actioncolumn',
            width: 30,
            sortable: false,
            items: [{
                icon: 'resources/images/icons/delete.png',
                tooltip: 'Enlever ce produit de la liste',
                handler: function(grid, rowIndex, colIndex, node, e, record, rowNode) {
                    this.fireEvent('del_click', grid, rowIndex, colIndex, node, e, record, rowNode);
                }
            }]
        });

        this.columns.splice(1, 0, {
            width: 30,
            renderer: function(value, metadata, record, rowIndex, colIndex, store) {
                if (record.get('locked_by_user')) {
                    metadata.tdCls = 'lock-icon';
                    metadata.tdAttr = Ext.String.format('data-qtip="Ce produit est présentement utilisé par l\'usager \'{0}\'"', record.get('locked_by_user'));
                }
            }
        });

        this.columns.push({
            xtype: 'actioncolumn',
            width: 30,
            sortable: false,
            items: [{
                icon: 'resources/images/icons/add.png',
                tooltip: 'Ajouter à la commande',
                handler: function(grid, rowIndex, colIndex, node, e, record, rowNode) {
                    this.fireEvent('add_click', grid, rowIndex, colIndex, node, e, record, rowNode);
                }
            }]
        });

        var that = this;
        Ext.each(this.columns, function(col) {
            if (col.dataIndex == 'quantite_caisse') {
                col.editor = {
                    xtype: 'numberfield',
                    allowBlank: false,
                    minValue: 1,
                    listeners: {
                        specialkey: function(field, e) {
                            if (e.getKey() === e.ENTER) {
                                this.fireEvent('qc_enter_key', field, e);
                            }
                        }
                    }
                };
            }
        });

        this.plugins = [Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        })];

        this.viewConfig = {
            preserveScrollOnRefresh: true
        };

        this.callParent(arguments);
    }

});
