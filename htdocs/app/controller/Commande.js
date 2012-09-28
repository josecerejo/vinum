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
            },
            '#inventaire': {
                itemdblclick: function(view, record, item, index, e, eOpts) {
                    this.addCommandeItem(this._getFormViewInstance(view), record);
                }
            },
            '#commande': {
                edit: function(editor, e) {
                    var view = this._getFormViewInstance(editor.grid);
                    return this.updateCommandeAndInventaireItems(view, e);
                }
            },
            '#commande actioncolumn': {
                // see: http://mitchellsimoens.com/2012/02/ext-js-4/actioncolumn-and-mvc/
                click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    var view = this._getFormViewInstance(grid);
                    var rec = grid.store.getAt(rowIndex);
                    grid.store.removeAt(rowIndex);
                    this.removeCommandeItem(view, rec);
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
        var g = view.down('#inventaire');
        g.setTitle(Ext.String.format('Inventaire pour le produit "{0}"', record.get('type_vin')));
        g.store.load({
            params: {
                no_produit_interne: record.get('no_produit_interne')
            }
        });
    },

    updateCommandeAndInventaireItems: function(view, e) {
        var inv_grid = view.down('#inventaire');        
        var inv_rec = inv_grid.store.findRecord('no_inventaire', e.record.get('no_inventaire'));
        var qc_delta = e.value - e.originalValue; // possibly negative
        if (inv_rec.get('solde_caisse') - qc_delta < 0) {
            e.record.set('quantite_caisse', e.originalValue);
            Ext.Msg.show({
                title: 'Vinum',
                msg: 'Quantité insuffisante pour commander',
                icon: Ext.MessageBox.WARNING,
                buttons: Ext.MessageBox.OK
            });
            return false;
        }
        var qpc = inv_rec.get('quantite_par_caisse');
        e.record.set('quantite_bouteille', e.record.get('quantite_bouteille') + (qc_delta * qpc));
        inv_rec.set('solde', inv_rec.get('solde') - (qc_delta * qpc));
        inv_rec.set('solde_caisse', inv_rec.get('solde_caisse') - qc_delta);
        return true;
    },

    removeCommandeItem: function(view, rec) {
        var inv_grid = view.down('#inventaire');        
        var inv_rec = inv_grid.store.findRecord('no_inventaire', rec.get('no_inventaire'));
        inv_rec.set('solde', inv_rec.get('solde') + rec.get('quantite_bouteille'));
        inv_rec.set('solde_caisse', inv_rec.get('solde_caisse') + rec.get('quantite_caisse'));
    },

    addCommandeItem: function(view, record) {
        var g = view.down('#commande');
        if (record.get('solde_caisse') == 0) {
            Ext.Msg.show({
                title: 'Vinum',
                msg: 'Quantité insuffisante pour commander',
                icon: Ext.MessageBox.WARNING,
                buttons: Ext.MessageBox.OK
            });                                
            return false;
        }
        record.data.quantite_caisse = 1;
        var qpc = record.get('quantite_par_caisse');
        record.data.quantite_bouteille = qpc;
        record.data.commission = -1;
        record.data.statut = 'OK';        
        record.set('solde', record.get('solde') - qpc);
        record.set('solde_caisse', record.get('solde_caisse') - 1);
        // using set() on the commande record (once created) makes it dirty, which we don't want
        var commande = Ext.create('VIN.model.Commande', record.data);
        g.store.add(commande);
    }

});
