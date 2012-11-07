Ext.define('VIN.view.client.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.client_form',
    // requires: ['VIN.view.produit.List', 'VIN.view.client.ProduitList', 
    //            'VIN.view.inventaire.List', 'VIN.view.commande.List'],
    autoScroll: true,
    title: 'Client',
    closable: true,
    fieldDefaults: {
        labelAlign: 'top'
    },

    initComponent: function() {
        this.items = {
            html: '[formulaire pour éditer les champs d\'un client]'
        };
        this.callParent(arguments);
    }

});
