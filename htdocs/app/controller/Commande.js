Ext.define('VIN.controller.Commande', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.commande.Form'],
    models: ['VIN.model.Produit'],
    stores: ['VIN.store.Produits'],

    init: function() {
        this.control({
            '#client_combo': {
                select: function(field, records, eopts) {
                    var view = this._getFormViewInstance(field);
                    this.updateProduitsCommandes(view, records[0]);
                }
            },
            '#produit_combo': {
                select: function(field, records, eopts) {
                    var view = this._getFormViewInstance(field);
                    this.updateInventaire(view, records[0]);
                }                               
            },
            '#produits_commandes': {
                selectionchange: function(model, records) {
                    var view = this._getFormViewInstance(model.view);
                    this.updateInventaire(view, records[0]);
                }                
            }
        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('commande_form');
    },

    updateProduitsCommandes: function(view, record) {
        view.down('#produits_commandes').store.load({
            params: {
                no_client: record.get('no_client')
            }
        });
    },

    updateInventaire: function(view, record) {
        view.down('#inventaire').store.load({
            params: {
                no_produit_interne: record.get('no_produit_interne')
            }
        });
    }

});
