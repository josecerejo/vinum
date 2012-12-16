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
                no_inventaire: 1,
                no_produit_interne: 1,
                type_vin: 3,
                format: 1,
                quantite_par_caisse: 1,
                no_produit_saq: 1,
                no_commande_saq: 1,
                quantite_commandee: 1,
                quantite_recue: 1,
                date_commande: 1,
                date_recue: 1,
                prix_courant: 1,
                millesisme: 1,
                solde_caisse: 1,
                solde_bouteille: 1,
                statut: 1
            }
        });
        ig.store.load();
        Ext.getCmp('main_pnl').add(ig);
        Ext.getCmp('main_pnl').setActiveTab(ig);
    }

});
