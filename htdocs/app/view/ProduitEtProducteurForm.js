Ext.define('VIN.view.ProduitEtProducteurForm', {

    extend: 'Ext.form.Panel',
    alias: 'widget.pp_form',
    //requires: ['VIN.view.produit.Grid', 'VIN.view.producteur.Grid'],
    autoScroll: true,
    title: 'Produits et producteurs',
    closable: true,
    frame: true,
    fieldDefaults: {
        labelAlign: 'top'
    },

    initComponent: function() {

        var grid_height = 326;

            /*
        this.dockedItems = {
            xtype: 'toolbar',
            dock: 'top',
            items: [{
                text: 'Sauvegarder',
                itemId: 'save_btn',
                iconCls: 'disk-icon'
            }, {
                text: 'Créer une commande pour ce client',
                itemId: 'create_commande_btn',
                iconCls: 'commandes-add-icon'
            }]
        };
        */

        this.items = {
            bodyStyle: 'background-color:#dfe8f5',
            border: false,
            defaults: {
                bodyStyle: 'background-color:#dfe8f5',
                border: false,
                padding: 10,
                flex: .5
            },
            layout: 'hbox',
            items: [{
                // -----------------------------------------------------
                // left part panel
                layout: 'anchor',
                items: [{
                    xtype: 'vin_grid',
                    itemId: 'produit_g',
                    store: Ext.create('VIN.store.Produits'),
                    title: 'Produits',
                    resizable: { handles: 's' },
                    height: grid_height,
                    style: 'margin-bottom: 20px'
                }, {
                    xtype: 'vin_grid',
                    itemId: 'producteur_g',
                    store: Ext.create('VIN.store.Producteurs'),
                    title: 'Producteurs',
                    resizable: { handles: 's' },
                    height: grid_height
                }]
            }, {
                // -----------------------------------------------------
                // right part panel
                layout: 'anchor',
                // items: [{
                // }]
            }]
        };

        this.callParent(arguments);
    }

});
