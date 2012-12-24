Ext.define('VIN.controller.ProduitEtProducteur', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.ProduitEtProducteurForm'],
    models: ['VIN.model.Produit', 'VIN.model.Producteur'],
    stores: ['VIN.store.Produits', 'VIN.store.Producteurs'],

    init: function() {

        this.control({

            'pp_forms #produit_g': {
                selectionchange: function(model, records) {
                    if (records.length == 0) { return; }
                    var form = this._getFormViewInstance(model.view).down('#pp_produit_form');
                    form.load({
                        url: ajax_url_prefix + '/produit/load',
                        params: {
                            no_produit_interne: records[0].get('no_produit_interne')
                        },
                        callback: Ext.bind(function(records, operation, success) {
                        }, this)
                    });
                }
            },
            'pp_forms #producteur_g': {
                selectionchange: function(model, records) {
                    if (records.length == 0) { return; }
                    var form = this._getFormViewInstance(model.view).down('#pp_producteur_form');
                    form.load({
                        url: ajax_url_prefix + '/producteur/load',
                        params: {
                            no_producteur: records[0].get('no_producteur')
                        },
                        callback: Ext.bind(function(records, operation, success) {
                        }, this)
                    });
                }
            },
            'pp_forms #filter_produits_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var no_producteur = form.down('#no_producteur_tf').getValue();
                    if (no_producteur) {
                        var filter = form.down('#produit_g').filters.getFilter('no_producteur');
                        filter.setValue({eq: no_producteur});
                        filter.setActive(true);
                    } else {
                        Ext.Msg.show({
                            title: 'Vinum',
                            msg: Ext.String.format("Veuillez tout d'abord sélectionner un producteur dans la table de gauche"),
                            icon: Ext.MessageBox.INFO,
                            buttons: Ext.MessageBox.OK
                        });
                    }
                }
            },
            'pp_forms #all_produits_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var filter = form.down('#produit_g').filters.getFilter('no_producteur');
                    filter.setActive(false);
                }
            }

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('pp_forms');
    },

    createForm: function() {
        var ppf = Ext.create('widget.pp_forms');
        ppf.down('#produit_g').getStore().load();
        ppf.down('#producteur_g').getStore().load();
        Ext.getCmp('main_pnl').add(ppf);
        Ext.getCmp('main_pnl').setActiveTab(ppf);
    }

});
