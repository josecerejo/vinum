Ext.define('VIN.controller.Inventaire', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.inventaire.Form'],
    models: ['VIN.model.Inventaire'],
    stores: ['VIN.store.Inventaires'],

    init: function() {

        this.control({

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('inventaire_form');
    },

    createInventaireForm: function() {
        var ig = Ext.create('widget.inventaire_grid', {
            column_flex: {
                type_vin: 3,
                millesime: 1,
                format: 1,
                prix_restaurant: 1.5,
                prix_particulier: 1.5,
                prix_coutant: 1.5,
                solde_caisse: 1,
                solde_bouteille: 1,
                no_produit_saq: 1.5,
                no_commande_saq: 1.5,
                quantite_commandee: 1.5,
                quantite_recue: 1.5,
                date_commande: 2,
                date_recue: 2,
                statut: 1.5,
                quantite_par_caisse: 1
            }
        });
        Ext.getCmp('main_pnl').add(ig);
        Ext.getCmp('main_pnl').setActiveTab(ig);
    }

});
