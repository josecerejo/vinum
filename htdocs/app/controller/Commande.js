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
                    this.curr_client_rec = records[0].copy();
                }
            },
            '#produit_combo': {
                select: function(field, records, eopts) {
                    var view = this._getFormViewInstance(field);
                    this.updateInventaire(view, records[0]);
                    this.curr_produit_rec = records[0].copy();
                    var locked = this.curr_produit_rec.get('locked_by_user') != null;
                    view.down('#add_produit_btn').setDisabled(locked);
                    view.down('#add_produit_btn').setIconCls(locked ? 'lock-icon' : 'add-icon');
                }                               
            },
            '#client_produit': {
                selectionchange: function(model, records) {
                    var view = this._getFormViewInstance(model.view);
                    this.updateInventaire(view, records[0]);
                    this.curr_produit_rec = records[0].copy();
                }                
            },
            '#client_produit actioncolumn': {
                // see: http://mitchellsimoens.com/2012/02/ext-js-4/actioncolumn-and-mvc/
                remove_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    this.removeClientProduit(this._getFormViewInstance(grid), grid, rec, this.curr_client_rec);
                },
                add_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    var view = this._getFormViewInstance(grid);
                    if (rec.get('locked_by_user')) {
                        Ext.Msg.show({
                            title: 'Vinum',
                            msg: Ext.String.format("Ce produit est présentement utilisé dans une commande effectuée par l'usager '{0}'", 
                                                   rec.get('locked_by_user')),
                            icon: Ext.MessageBox.WARNING,
                            buttons: Ext.MessageBox.OK
                        });                                            
                        return;
                    }
                    var desired_qc = rec.get('quantite_caisse');
                    if (desired_qc) {                        
                        this.addCommandeProduit(view, desired_qc, this.curr_produit_rec);
                    } else {
                        Ext.Msg.show({
                            title: 'Vinum',
                            msg: "Veuillez spécifier une quantité (en cliquant dans la cellule voulue de la colonne 'Quantité (c)')",
                            icon: Ext.MessageBox.WARNING,
                            buttons: Ext.MessageBox.OK
                        });                           
                        return;
                    }
                }
            },
            '#add_produit_btn': {
                click: function(btn) {
                    var view = this._getFormViewInstance(btn);
                    var is_valid = true;
                    Ext.Array.each(['#client_combo', '#produit_combo', '#add_produit_qc_nf'], function(item_id) {
                        if (!view.down(item_id).getValue()) {
                            view.down(item_id).markInvalid('Ce champ est requis');
                            is_valid = false;
                        }            
                    });
                    if (is_valid) {
                        this.addClientProduit(view, this.curr_client_rec);
                        var desired_qc = view.down('#add_produit_qc_nf').getValue();
                        this.addCommandeProduit(view, desired_qc, this.curr_produit_rec);
                    }
                }
            },
            // '#commande button': {
            //     click: function(btn) {
            //         var view = this._getFormViewInstance(btn);
            //         view.down('#inventaire').getStore().removeAll();
            //         view.down('#commande').getStore().removeAll();
            //         this.updateInventaire(view, this.curr_produit_rec);
            //     }
            // },
            '#commande rowactions': {
                groupaction: function(grid, records, action, groupValue) {
                    var view = this._getFormViewInstance(grid);
                    var type_vin = groupValue;
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit "{0}" de la commande?', type_vin), function(btn) {
                        if (btn == 'yes') {
                            var group_recs = view.down('#commande').getStore().query('type_vin', type_vin);
                            view.down('#commande').getStore().remove(group_recs.items);
                            if (this.current_produit_rec.get('type_vin') == type_vin) {
                                this.updateInventaire(view, this.curr_produit_rec);
                            }
                        }
                    });
                }
            }
        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('commande_form');
    },

    updateClientProduit: function(view, client_rec) {
        view.down('#client_produit').store.load({
            params: {
                no_client: client_rec.get('no_client')
            },
            callback: function(records, operation, success) {
                var g = view.down('#client_produit');
                g.setTitle(Ext.String.format('Liste de produits habituels pour le client "{0}" ({1})', 
                                             client_rec.get('nom_social'), g.store.getCount()));
            }
        });
    },

    removeClientProduit: function(view, grid, record, curr_client_rec) {
        Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit "{0}" de la liste de produits habituels de ce client?', record.get('type_vin')), function(btn) {
            if (btn == 'yes') {
                //grid.store.remove(record);
                view.submit({
                    url: '/vinum_server/client/remove_produit',
                    params: {
                        no_client: curr_client_rec.get('no_client'),
                        no_produit_interne: record.get('no_produit_interne')
                    },
                    success: function(_form, action) {
                        grid.store.reload();
                    },
                    failure: function(_form, action) {
                        VIN.utils.serverErrorPopup(action.result.error_msg);
                    }
                });
            }
        });        
    },
    
    addClientProduit: function(view, curr_client_rec) {
        var cp_grid = view.down('#client_produit');
        var produit = view.down('#produit_combo').getValue();
        if (!cp_grid.getStore().findRecord('type_vin', produit)) {
            var msg = Ext.String.format('Voulez-vous ajouter le produit "{0}" à la liste de produits habituels de ce client?', produit);
            Ext.Msg.confirm('Vinum', msg, function(btn) {
                if (btn == 'yes') {
                    view.submit({
                        url: '/vinum_server/client/add_produit',
                        params: {
                            no_client: curr_client_rec.get('no_client')
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

    addCommandeProduit: function(view, desired_qc, curr_produit_rec) {
        var ig = view.down('#inventaire');
        var cg = view.down('#commande');

        if (cg.store.find('no_produit_interne', curr_produit_rec.get('no_produit_interne')) != -1) {
            Ext.Msg.show({
                title: 'Vinum',
                msg: "Ce produit existe déjà dans la commande",
                icon: Ext.MessageBox.WARNING,
                buttons: Ext.MessageBox.OK
            });
            return;
        }

        var actif_recs = ig.getStore().query('statut', /Actif|En réserve/);
        actif_recs.sort([{property:'statut', direction:'ASC', root:'data'}, 
                         {property:'date_commande', direction:'ASC', root:'data'}]);

        // actif_recs.each(function(rec) {
        //     console.log(rec.get('date_commande'), rec.get('statut'));
        // });

        var rem_qc = desired_qc;
        for (var i = 0; i < actif_recs.getCount(); i++) {

            var rec = actif_recs.getAt(i);
            rec.set('statut', 'Actif');
            if (rem_qc == 0) {                
                break;
            }
            
            // solde caisses
            var qc = Ext.Array.min([rem_qc, rec.get('solde_caisse')]);
            rem_qc -= qc;
            rec.set('solde_caisse', rec.get('solde_caisse') - qc);
            
            // solde bouteilles
            var qb = Ext.Array.min([qc * rec.get('quantite_par_caisse'), rec.get('solde')]);
            rec.set('solde', rec.get('solde') - qb);            

            // new commande record
            var inv_comm = rec.copy();
            inv_comm.set('quantite_caisse', qc);
            inv_comm.set('quantite_bouteille', qb);
            inv_comm.set('commission', -1);
            inv_comm.set('statut', 'OK');
            var comm = Ext.create('VIN.model.Commande', inv_comm.data);
            cg.store.add(comm);

            if (rec.get('solde_caisse') == 0) {
                rec.set('statut', 'Inactif');
            } 
        }
        
        if (rem_qc > 0) {
            var comm = Ext.create('VIN.model.Commande', {
                no_produit_interne: curr_produit_rec.get('no_produit_interne'),
                type_vin: curr_produit_rec.get('type_vin'),
                format: curr_produit_rec.get('format'),
                no_produit_saq: -1,
                no_commande_saq: -1,
                quantite_caisse: rem_qc,
                quantite_bouteille: rem_qc * curr_produit_rec.get('quantite_par_caisse'),
                commission: -1,
                statut: 'BO'
            });
            cg.store.add(comm);
            
        }
    }

});
