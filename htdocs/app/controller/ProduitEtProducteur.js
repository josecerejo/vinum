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
