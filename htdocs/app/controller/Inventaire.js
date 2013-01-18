Ext.define('VIN.controller.Inventaire', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.inventaire.Form'],
    models: ['VIN.model.Inventaire'],
    stores: ['VIN.store.Inventaires'],

    init: function() {

        this.control({

            'inventaire_grid #show_colors_btn': {
                toggle: function(btn, pressed) {
                    var g = this._getFormViewInstance(btn);
                    g.use_colors = !g.use_colors;
                    g.getView().refresh();
                }
            },

            'inventaire_grid #type_vin_external_filter_tf': {
                keyup: function(tf, e, opts) {
                    var g = this._getFormViewInstance(tf);
                    var tv_filter = g.filters.getFilter('type_vin');
                    if (tf.getValue()) {
                        tv_filter.setValue(tf.getValue());
                        tv_filter.setActive(true);
                    } else {
                        tv_filter.setValue('');
                        tv_filter.setActive(false);
                    }
                }
            }

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('inventaire_grid');
    },

    createInventaireForm: function() {
        var invf = Ext.create('VIN.view.inventaire.Form');
        Ext.getCmp('main_pnl').add(invf);
        Ext.getCmp('main_pnl').setActiveTab(invf);
    },

    createInventaireGrid: function() {
        var ig = Ext.create('VIN.view.inventaire.Grid', {
            store: Ext.create('VIN.store.Inventaires'),
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
                no_demande_saq: 1.5,
                quantite_commandee: 1.5,
                quantite_recue: 1.5,
                date_commande: 2,
                date_recue: 2,
                statut_inventaire: 1.5,
                quantite_par_caisse: 1,
                age_in_days: 1
            }
        });
        Ext.getCmp('main_pnl').add(ig);
        Ext.getCmp('main_pnl').setActiveTab(ig);
    }

});
