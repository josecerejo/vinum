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
                    this.updateClientProduit(view, records[0]);
                    this.current_no_client = records[0].get('no_client');
                }
            },
            '#produit_combo': {
                select: function(field, records, eopts) {
                    var view = this._getFormViewInstance(field);
                    this.updateInventaire(view, records[0]);
                }                               
            },
            '#client_produit': {
                selectionchange: function(model, records) {
                    var view = this._getFormViewInstance(model.view);
                    this.updateInventaire(view, records[0]);
                }                
            },
            '#client_produit actioncolumn': {
                // see: http://mitchellsimoens.com/2012/02/ext-js-4/actioncolumn-and-mvc/
                remove_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    this.removeClientProduitItem(this._getFormViewInstance(grid), grid, rec, this.current_no_client);
                },
                add_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    alert('add!');
                    //this._getFormViewInstance(grid).down('#client_combo').setIconCls('lock-icon');
                }
            },
            '#add_produit_btn': {
                click: function(btn) {
                    var view = this._getFormViewInstance(btn);
                    var qte = this.addProduit(view, this.current_no_client);
                    if (qte) {
                        this.addCommandeItem(view, qte);
                    }
                }
            },
            // '#inventaire': {
            //     itemdblclick: function(view, record, item, index, e, eOpts) {
            //         this.addCommandeItem(this._getFormViewInstance(view), record);
            //     }
            // },
            '#inventaire actioncolumn': {
                // see: http://mitchellsimoens.com/2012/02/ext-js-4/actioncolumn-and-mvc/
                click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    this.addCommandeItem(this._getFormViewInstance(grid), rec);
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

    updateClientProduit: function(view, record) {
        view.down('#client_produit').store.load({
            params: {
                no_client: record.get('no_client')
            }
        });
    },

    removeClientProduitItem: function(view, grid, record, current_no_client) {
        Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit "{0}" de la liste de produits habituels de ce client?', record.get('type_vin')), function(btn) {
            if (btn == 'yes') {
                grid.store.remove(record);
                view.submit({
                    url: '/vinum_server/client/remove_produit',
                    params: {
                        no_client: current_no_client,
                        no_produit_interne: record.get('no_produit_interne')
                    },
                    success: function(_form, action) {
                        //store.reload();
                    },
                    failure: function(_form, action) {
                        VIN.utils.serverErrorPopup(action.result.error_msg);
                    }
                });
            }
        });        
    },

    // return quantite commandee
    addProduit: function(view, current_no_client) {
        var is_valid = true;
        Ext.Array.each(['#client_combo', '#produit_combo', '#add_produit_qte_nf'], function(item_id) {
            if (!view.down(item_id).getValue()) {
                view.down(item_id).markInvalid('Ce champ est requis');
                is_valid = false;
            }            
        });
        if (!is_valid) return null;
        var cp_grid = view.down('#client_produit');
        var produit = view.down('#produit_combo').getValue();
        if (!cp_grid.getStore().findRecord('type_vin', produit)) {
            Ext.Msg.confirm('Vinum', Ext.String.format('Voulez-vous ajouter le produit "{0}" à la liste de produits habituels de ce client?', produit), function(btn) {
                if (btn == 'yes') {
                    //grid.store.remove(record);
                    view.submit({
                        url: '/vinum_server/client/add_produit',
                        params: {
                            no_client: current_no_client
                        },
                        success: function(_form, action) {
                            cp_grid.getStore().reload();
                        },
                        failure: function(_form, action) {
                            VIN.utils.serverErrorPopup(action.result.error_msg);
                        }
                    });
                }
            });        
        } 
        return view.down('#add_produit_qte_nf').getValue();
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
        if (inv_rec.get('solde') < qc_delta * qpc) {
            e.record.set('quantite_bouteille', e.record.get('quantite_bouteille') + inv_rec.get('solde'));
            inv_rec.set('solde', 0);
            inv_rec.set('solde_caisse', 0);
        } else {
            e.record.set('quantite_bouteille', e.record.get('quantite_bouteille') + (qc_delta * qpc));
            inv_rec.set('solde', inv_rec.get('solde') - (qc_delta * qpc));
            inv_rec.set('solde_caisse', inv_rec.get('solde_caisse') - qc_delta);
        }
        return true;
    },

    removeCommandeItem: function(view, rec) {
        var inv_grid = view.down('#inventaire');        
        var inv_rec = inv_grid.store.findRecord('no_inventaire', rec.get('no_inventaire'));
        inv_rec.set('solde', inv_rec.get('solde') + rec.get('quantite_bouteille'));
        inv_rec.set('solde_caisse', inv_rec.get('solde_caisse') + rec.get('quantite_caisse'));
    },

    addCommandeItem: function(view, qte) {
        var ig = view.down('#inventaire');
        var actif_recs = ig.getStore().query('statut', /Actif|En réserve/);
        actif_recs.sort([{property:'statut', direction:'ASC', root:'data'}, 
                         {property:'date_commande', direction:'ASC', root:'data'}]);

        // actif_recs.each(function(rec) {
        //     console.log(rec.get('date_commande'), rec.get('statut'));
        // });

        var curr_qte = 0;
        var rem_qte = qte;
        for (var i = 0; i < actif_recs.getCount(); i++) {
            var rec = actif_recs.getAt(i);
            var q = Ext.Array.min([rem_qte, rec.get('solde_caisse')]);
            curr_qte += q;
            rem_qte -= q;
            rec.set('solde_caisse', rec.get('solde_caisse') - q);
            // solde bouteilles
            var qb = Ext.Array.min([q * rec.get('quantite_par_caisse'), rec.get('solde')]);
            rec.set('solde', rec.get('solde') - qb);            
            if (rec.get('solde_caisse') == 0) {
                rec.set('statut', 'Inactif');
            } else {
                rec.set('statut', 'Actif');
            }
            if (rem_qte == 0) {
                break;
            }
        }
    }

});
