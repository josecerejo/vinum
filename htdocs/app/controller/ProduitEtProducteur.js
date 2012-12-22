Ext.define('VIN.controller.ProduitEtProducteur', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.ProduitEtProducteurForm'],
    models: ['VIN.model.Produit', 'VIN.model.Producteur'],
    stores: ['VIN.store.Produits', 'VIN.store.Producteurs'],

    init: function() {

        this.control({

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('pp_form');
    },

    createForm: function() {
        var ppf = Ext.create('widget.pp_form');
        ppf.down('#produit_g').getStore().load();
        ppf.down('#producteur_g').getStore().load();
        Ext.getCmp('main_pnl').add(ppf);
        Ext.getCmp('main_pnl').setActiveTab(ppf);
    }

});
