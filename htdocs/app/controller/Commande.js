Ext.define('VIN.controller.Commande', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.commande.Form', 'VIN.view.client.Form'],
    models: ['VIN.model.Produit'],
    stores: ['VIN.store.Produits'],

    init: function() {

        this.curr = {
            client_rec: undefined,
            produit_rec: undefined,
            no_commande_facture: undefined
        };

        this.control({
            '#client_combo': {
                select: function(field, records, eopts) {
                    var view = this._getFormViewInstance(field);
                    this.curr.client_rec = records[0].copy();
                    var r = this.curr.client_rec;
                    var adresse = Ext.String.format('{0} {1} {2} {3}', r.get('no_civique')||'<no?>', 
                                                    r.get('rue')||'<rue?>', r.get('ville')||'<ville?>',
                                                    r.get('code_postal')||'<code_postal?>');
                    view.down('#adresse_tf').setValue(adresse);
                    var tc = '';
                    if (r.get('type_client') == '1') {
                        tc = 'restaurant';
                        view.down('#default_commission_combo').setValue(0.16);
                    } else if (r.get('type_client') == '2') {
                        tc = 'particulier';
                        view.down('#default_commission_combo').setValue(0.23);
                    }
                    view.down('#type_client_tf').setValue(tc);
                    view.down('#details_client_btn').setDisabled(false);
                    view.down('#succ_tf').setValue(r.get('no_succursale')||'');
                    this.updateClientProduit(view);
                }
            },
            '#details_client_btn': {
                click: function(btn) {
                    var cf = Ext.create('widget.client_form');
                    var mp = Ext.getCmp('main_pnl');
                    mp.add(cf);
                    mp.setActiveTab(cf);
                }
            },
            '#direct_df': {
                focus: function(field) {
                    var view = this._getFormViewInstance(field);
                    view.down('#direct_rb').setValue(true);
                }
            },
            '#succ_tf': {
                focus: function(field) {
                    var view = this._getFormViewInstance(field);
                    view.down('#succ_rb').setValue(true);
                }
            },
            '#pickup_df': {
                focus: function(field) {
                    var view = this._getFormViewInstance(field);
                    view.down('#pickup_rb').setValue(true);
                }
            },
            '#produit_combo': {
                select: function(field, records, eopts) {
                    var view = this._getFormViewInstance(field);
                    this.updateInventaire(view, records[0]);
                    this.curr.produit_rec = records[0].copy();
                    var locked = this.curr.produit_rec.get('locked_by_user') != null;
                    view.down('#add_produit_btn').setDisabled(locked);
                    view.down('#add_produit_btn').setIconCls(locked ? 'lock-icon' : 'add-icon');
                }                               
            },
            '#client_produit': {
                selectionchange: function(model, records) {
                    var view = this._getFormViewInstance(model.view);
                    this.updateInventaire(view, records[0]);
                    this.curr.produit_rec = records[0].copy();
                }                
            },
            '#client_produit actioncolumn': {
                // see: http://mitchellsimoens.com/2012/02/ext-js-4/actioncolumn-and-mvc/
                remove_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    this.removeClientProduit(this._getFormViewInstance(grid), grid, rec);
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
                        this.addCommandeProduit(view, desired_qc);
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
                        this.addClientProduit(view);
                        var desired_qc = view.down('#add_produit_qc_nf').getValue();
                        this.addCommandeProduit(view, desired_qc);
                    }
                }
            },
            '#commande rowactions': {
                groupaction: function(grid, records, action, groupValue) {
                    var view = this._getFormViewInstance(grid);
                    var type_vin = groupValue;
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit "{0}" de la commande?', type_vin), 
                                    Ext.bind(function(btn) {
                                        if (btn == 'yes') {
                                            var group_recs = view.down('#commande').getStore().query('type_vin', type_vin);
                                            view.down('#commande').getStore().remove(group_recs.items);
                                            if (this.curr.produit_rec.get('type_vin') == type_vin) {
                                                this.updateInventaire(view, this.curr.produit_rec);
                                            }
                                        }
                                    }, this));
                }
            },
            '#download_facture_btn': {
                click: function(btn) {
                    var view = this._getFormViewInstance(btn);
                    this.saveCommande(view, Ext.bind(function() {
                        location.href = Ext.String.format('{0}/commande/download_facture?no_commande_facture={1}', 
                                                          ajax_url_prefix, this.curr.no_commande_facture);
                    }, this));
                }
            },
            '#save_commande_btn': {
                click: function(btn) {
                    var view = this._getFormViewInstance(btn);
                    this.saveCommande(view);
                }
            },
            '#email_facture_btn': {
                click: function(btn) {
                    var view = this._getFormViewInstance(btn);
                    this.saveCommande(view, Ext.bind(function() {
                        var courriel = this.curr.client_rec.get('courriel');
                        if (!courriel) {
                            Ext.Msg.show({
                                title: 'Vinum',
                                msg: "L'adresse courriel de ce client n'est pas définie",
                                icon: Ext.MessageBox.WARNING,
                                buttons: Ext.MessageBox.OK,
                                fn: function() {
                                    view.email_win.down('#email_addr_tf').markInvalid("L'adresse courriel de ce client n'est pas définie");
                                    view.email_win.show();
                                }
                            });                               
                        } else {
                            view.email_win.down('#email_addr_tf').setValue(courriel);
                            view.email_win.show();
                        }
                    }, this));
                }
            },
            '#cancel_email_btn': {
                click: function(btn) {
                    var email_win = btn.up('#email_win');
                    email_win.hide();                    
                }
            },
            '#send_email_btn': {
                click: function(btn) {
                    wait_mask.show();
                    btn.up('#email_win').down('#email_form').submit({
                        params: {
                            no_commande_facture: this.curr.no_commande_facture
                        },
                        success: function(_form, action) {
                            wait_mask.hide();
                            btn.up('#email_win').hide();
                            Ext.Msg.show({
                                title: 'Vinum',
                                msg: Ext.String.format("Le message a été envoyé"),
                                icon: Ext.MessageBox.INFO,
                                buttons: Ext.MessageBox.OK
                            });                                            
                        }
                    });
                }
            },
            '#commande': {
                edit: function(editor, e) {
                    var view = this._getFormViewInstance(editor.grid);
                    var r = e.record;
                    r.set('montant_commission', r.get('commission') * VIN.utils.removeTaxes(r.get('prix_coutant')));
                }
            }

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('commande_form');
    },

    updateClientProduit: function(view) {
        view.down('#client_produit').store.load({
            params: {
                no_client: this.curr.client_rec.get('no_client')
            },
            callback: Ext.bind(function(records, operation, success) {
                var g = view.down('#client_produit');
                g.setTitle(Ext.String.format('Liste de produits habituels pour le client "{0}" ({1})', 
                                             this.curr.client_rec.get('nom_social'), g.store.getCount()));
            }, this)
        });
    },

    removeClientProduit: function(view, grid, record) {
        Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit "{0}" de la liste de produits habituels de ce client?', 
                                                   record.get('type_vin')), 
                        Ext.bind(function(btn) {
                            if (btn == 'yes') {
                                //grid.store.remove(record);
                                view.submit({
                                    url: ajax_url_prefix + '/client/remove_produit',
                                    params: {
                                        no_client: this.curr.client_rec.get('no_client'),
                                        no_produit_interne: record.get('no_produit_interne')
                                    },
                                    success: function(_form, action) {
                                        grid.store.reload();
                                    }
                                });
                            }
                        }, this));        
    },
    
    addClientProduit: function(view) {
        var cp_grid = view.down('#client_produit');
        var produit = view.down('#produit_combo').getValue();
        if (!cp_grid.getStore().findRecord('type_vin', produit)) {
            var msg = Ext.String.format('Voulez-vous ajouter le produit "{0}" à la liste de produits habituels de ce client?', produit);
            Ext.Msg.confirm('Vinum', msg, Ext.bind(function(btn) {
                if (btn == 'yes') {
                    view.submit({
                        url: ajax_url_prefix + '//client/add_produit',
                        params: {
                            no_client: this.curr.client_rec.get('no_client')
                        },
                        success: function(_form, action) {
                            cp_grid.getStore().reload();                            
                        }
                    });
                }
            }, this));        
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

    addCommandeProduit: function(view, desired_qc) {
        var ig = view.down('#inventaire');
        var cg = view.down('#commande');

        if (cg.store.find('no_produit_interne', this.curr.produit_rec.get('no_produit_interne')) != -1) {
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
            var default_commission = view.down('#default_commission_combo').getValue();
            inv_comm.set('commission', default_commission);
            var pc = inv_comm.get('prix_coutant');
            inv_comm.set('montant_commission', VIN.utils.removeTaxes(pc) * default_commission);
            inv_comm.set('statut', 'OK');
            var comm = Ext.create('VIN.model.Commande', inv_comm.data);
            cg.store.add(comm);

            if (rec.get('solde_caisse') == 0) {
                rec.set('statut', 'Inactif');
            } 
        }
        
        if (rem_qc > 0) {
            var comm = Ext.create('VIN.model.Commande', {
                no_produit_interne: this.curr.produit_rec.get('no_produit_interne'),
                type_vin: this.curr.produit_rec.get('type_vin'),
                format: this.curr.produit_rec.get('format'),
                no_produit_saq: -1,
                no_commande_saq: -1,
                quantite_caisse: rem_qc,
                quantite_bouteille: rem_qc * this.curr.produit_rec.get('quantite_par_caisse'),
                commission: 0.16,
                statut: 'BO'
            });
            cg.store.add(comm);
            
        }
    },

    saveCommande: function(view, callback) {
        if (view.down('#commande').getStore().getCount() == 0) {
            Ext.Msg.show({
                title: 'Vinum',
                msg: "La commande ne contient aucun produit",
                icon: Ext.MessageBox.WARNING,
                buttons: Ext.MessageBox.OK
            });                                            
            return;
        }
        view.submit({
            url: ajax_url_prefix + '/commande/save',
            params: {
                no_client: this.curr.client_rec.get('no_client'),
                no_commande_facture: this.curr.no_commande_facture,
                items: Ext.JSON.encode(Ext.Array.pluck(view.down('#commande').getStore().getRange(), 'data'))
            },
            success: Ext.bind(function(_form, action) {
                this.curr.no_commande_facture = action.result.no_commande_facture;
                view.down('#download_facture_btn').setDisabled(false);
                view.down('#email_facture_btn').setDisabled(false);
                if (callback !== undefined) {
                    callback();
                } else {
                    Ext.Msg.show({
                        title: 'Vinum',
                        msg: Ext.String.format("La facture #{0} a été enregistrée et peut maintenant être téléchargée",
                                               this.curr.no_commande_facture),
                        icon: Ext.MessageBox.INFO,
                        buttons: Ext.MessageBox.OK
                    });                            
                }
            }, this)
        });
    }

});
