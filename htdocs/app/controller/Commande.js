Ext.define('VIN.controller.Commande', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.commande.Form'],//, 'VIN.view.client.Form'],
    models: ['VIN.model.Produit'],
    stores: ['VIN.store.Produits'],

    init: function() {

        this.control({
            'commande_form': {
                beforeclose: function(panel) {
                    if (panel.down('#commande').getStore().getCount() > 0) {
                        Ext.Msg.confirm('Vinum', 
                                        "La commande n'a pas été envoyée par courriel, êtes-vous certain de vouloir l'annuler?",
                                        function(btn) {
                                            if (btn == 'yes') {
                                                panel.ownerCt.remove(panel);
                                            }
                                        });
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            'commande_form #nom_social_dd': {
                select: function(field, records, eopts) {
                    var form = this._getFormViewInstance(field);
                    //form.curr.client_rec = records[0].copy();
                    this.loadClientPart(form, records[0].get('no_client'));
                }
            },
            '#details_client_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var cf = Ext.create('widget.client_form');
                    var mp = Ext.getCmp('main_pnl');
                    mp.add(cf);
                    mp.setActiveTab(cf);
                    cf.load({
                        url: ajax_url_prefix + '/client/load',
                        params: {
                            no_client: form.curr.client_rec.get('no_client')
                        }
                    });
                }
            },
            '#direct_df': {
                focus: function(field) {
                    var form = this._getFormViewInstance(field);
                    form.down('#direct_rb').setValue(true);
                }
            },
            'commande_form #succ_combo': {
                focus: function(field) {
                    var form = this._getFormViewInstance(field);
                    form.down('#succ_rb').setValue(true);
                }
            },
            'commande_form #pickup_df': {
                focus: function(field) {
                    var form = this._getFormViewInstance(field);
                    form.down('#pickup_rb').setValue(true);
                }
            },
            '#produit_combo': {
                select: function(field, records, eopts) {
                    var form = this._getFormViewInstance(field);
                    this.updateInventaire(form, records[0]);
                    form.curr.produit_rec = records[0].copy();
                    var locked = form.curr.produit_rec.get('locked_by_user') != null;
                    form.down('#add_produit_btn').setDisabled(locked);
                    form.down('#add_produit_btn').setIconCls(locked ? 'lock-icon' : 'add-icon');
                }                               
            },
            '#client_produit': {
                selectionchange: function(model, records) {
                    var form = this._getFormViewInstance(model.view);
                    this.updateInventaire(form, records[0]);
                    form.curr.produit_rec = records[0].copy();
                }                
            },
            '#client_produit actioncolumn': {
                // see: http://mitchellsimoens.com/2012/02/ext-js-4/actioncolumn-and-mvc/
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    this.removeClientProduit(this._getFormViewInstance(grid), grid, rec);
                },
                add_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    var form = this._getFormViewInstance(grid);
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
                        this.addCommandeProduit(form, desired_qc);
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
                    var form = this._getFormViewInstance(btn);
                    var is_valid = true;
                    Ext.Array.each(['#nom_social_dd', '#produit_combo', '#add_produit_qc_nf'], function(item_id) {
                        if (!form.down(item_id).getValue()) {
                            form.down(item_id).markInvalid('Ce champ est requis');
                            is_valid = false;
                        }            
                    });
                    if (is_valid) {
                        this.addClientProduit(form);
                        var desired_qc = form.down('#add_produit_qc_nf').getValue();
                        this.addCommandeProduit(form, desired_qc);
                    }
                }
            },
            '#commande rowactions': {
                groupaction: function(grid, records, action, groupValue) {
                    var form = this._getFormViewInstance(grid);
                    var tv = groupValue;
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit "{0}" de la commande?', tv), 
                                    Ext.bind(function(btn) {
                                        if (btn == 'yes') {
                                            var group_recs = form.down('#commande').getStore().query('type_vin', tv);
                                            form.down('#commande').getStore().remove(group_recs.items);
                                            delete form.inventaire_cache[tv];
                                            if (form.curr.produit_rec.get('type_vin') == tv) {
                                                this.updateInventaire(form, form.curr.produit_rec);
                                            }
                                        }
                                    }, this));
                }
            },
            '#preview_facture_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.saveCommande(form, Ext.bind(function() {
                        var url = Ext.String.format('{0}/commande/download_facture?no_commande_facture={1}&attach=0', 
                                                    ajax_url_prefix, form.curr.no_commande_facture);
                        window.open(url, '_blank');
                    }, this));
                }
            },
            '#download_facture_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.saveCommande(form, Ext.bind(function() {
                        var url = Ext.String.format('{0}/commande/download_facture?no_commande_facture={1}&attach=1', 
                                                    ajax_url_prefix, form.curr.no_commande_facture);
                        location.href = url;
                    }, this));
                }
            },
            // '#save_commande_btn': {
            //     click: function(btn) {
            //         var form = this._getFormViewInstance(btn);
            //         this.saveCommande(form);
            //     }
            // },
            '#email_facture_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.saveCommande(form, Ext.bind(function() {
                        var courriel = form.curr.client_rec.get('courriel');
                        if (!courriel) {
                            Ext.Msg.show({
                                title: 'Vinum',
                                msg: "L'adresse courriel de ce client n'est pas définie",
                                icon: Ext.MessageBox.WARNING,
                                buttons: Ext.MessageBox.OK,
                                fn: Ext.bind(function() {
                                    form.email_win.down('#email_addr_tf').setValue('');
                                    form.email_win.down('#email_addr_tf').markInvalid("L'adresse courriel de ce client n'est pas définie");
                                    form.email_win.down('#email_subject_tf').setValue(Ext.String.format('Facture #{0}', 
                                                                                                        form.curr.no_commande_facture));
                                    form.email_win.show();
                                }, this)
                            });                               
                        } else {
                            form.email_win.down('#email_addr_tf').setValue(courriel);
                            form.email_win.down('#email_subject_tf').setValue(Ext.String.format('Facture #{0}', 
                                                                                                form.curr.no_commande_facture));
                            form.email_win.show();
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
                    var ew = btn.up('#email_win');
                    var form = ew.parent_form;
                    var ef = ew.down('#email_form');
                    if (ef.getForm().isValid()) {
                        wait_mask.show();
                        ef.submit({
                            params: {
                                no_commande_facture: form.curr.no_commande_facture
                            },
                            success: function(_form, action) {
                                wait_mask.hide();
                                btn.up('#email_win').hide();
                                Ext.Msg.show({
                                    title: 'Vinum',
                                    msg: Ext.String.format("Le courriel a été envoyé"),
                                    icon: Ext.MessageBox.INFO,
                                    buttons: Ext.MessageBox.OK
                                });                                            
                            }
                        });
                    }
                }
            },
            '#commande': {
                edit: function(editor, e) {
                    var form = this._getFormViewInstance(editor.grid);
                    var r = e.record;
                    r.set('montant_commission', r.get('commission') * VIN.utils.removeTaxes(r.get('prix_coutant')));
                }
            }

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('commande_form');
    },

    updateClientProduit: function(form) {
        form.down('#client_produit').store.load({
            params: {
                no_client: form.curr.client_rec.get('no_client')
            },
            callback: Ext.bind(function(records, operation, success) {
                var g = form.down('#client_produit');
                g.setTitle(Ext.String.format('Liste de produits habituels pour le client "{0}" ({1})', 
                                             form.curr.client_rec.get('nom_social'), g.store.getCount()));
            }, this)
        });
    },

    removeClientProduit: function(form, grid, record) {
        Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit "{0}" de la liste de produits habituels de ce client?', 
                                                   record.get('type_vin')), 
                        Ext.bind(function(btn) {
                            if (btn == 'yes') {
                                //grid.store.remove(record);
                                form.submit({
                                    url: ajax_url_prefix + '/client/remove_produit',
                                    params: {
                                        no_client: form.curr.client_rec.get('no_client'),
                                        no_produit_interne: record.get('no_produit_interne')
                                    },
                                    success: function(_form, action) {
                                        grid.store.reload();
                                    }
                                });
                            }
                        }, this));        
    },
    
    addClientProduit: function(form) {
        var cp_grid = form.down('#client_produit');
        var produit = form.down('#produit_combo').getValue();
        if (!cp_grid.getStore().findRecord('type_vin', produit)) {
            var msg = Ext.String.format('Voulez-vous ajouter le produit "{0}" à la liste de produits habituels de ce client?', produit);
            Ext.Msg.confirm('Vinum', msg, Ext.bind(function(btn) {
                if (btn == 'yes') {
                    form.submit({
                        url: ajax_url_prefix + '//client/add_produit',
                        params: {
                            no_client: form.curr.client_rec.get('no_client')
                        },
                        success: function(_form, action) {
                            cp_grid.getStore().reload();                            
                        }
                    });
                }
            }, this));        
        } 
    },

    updateInventaire: function(form, record) {
        var g = form.down('#inventaire');
        var tv = record.get('type_vin');
        g.setTitle(Ext.String.format('Inventaire pour le produit "{0}"', tv));
        if (form.inventaire_cache.hasOwnProperty(tv)) {            
            g.store.loadRecords(form.inventaire_cache[tv]);
        } else {
            g.store.load({
                params: {
                    no_produit_interne: record.get('no_produit_interne')
                },
                callback: Ext.bind(function(recs, op, success) {
                    form.inventaire_cache[tv] = recs;
                }, this)
            });
        }
    },

    addCommandeProduit: function(form, desired_qc) {
        var ig = form.down('#inventaire');
        var cg = form.down('#commande');

        if (cg.store.find('no_produit_interne', form.curr.produit_rec.get('no_produit_interne')) != -1) {
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
        var default_commission = form.down('#default_commission_combo').getValue();
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
            // backorders
            var comm = Ext.create('VIN.model.Commande', {
                no_produit_interne: form.curr.produit_rec.get('no_produit_interne'),
                type_vin: form.curr.produit_rec.get('type_vin'),
                format: form.curr.produit_rec.get('format'),
                no_produit_saq: -1,
                no_commande_saq: -1,
                quantite_caisse: rem_qc,
                quantite_bouteille: rem_qc * form.curr.produit_rec.get('quantite_par_caisse'),
                commission: default_commission,
                statut: 'BO'
            });
            cg.store.add(comm);
            
        }
    },

    saveCommande: function(form, callback) {
        if (form.down('#commande').getStore().getCount() == 0) {
            Ext.Msg.show({
                title: 'Vinum',
                msg: "La commande ne contient aucun produit",
                icon: Ext.MessageBox.WARNING,
                buttons: Ext.MessageBox.OK
            });                                            
            return;
        }
        form.submit({
            url: ajax_url_prefix + '/commande/save',
            params: {
                no_client: form.curr.client_rec.get('no_client'),
                no_commande_facture: form.curr.no_commande_facture,
                items: Ext.JSON.encode(Ext.Array.pluck(form.down('#commande').getStore().getRange(), 'data'))
            },
            success: Ext.bind(function(_form, action) {
                form.curr.no_commande_facture = action.result.no_commande_facture;
                form.down('#download_facture_btn').setDisabled(false);
                form.down('#email_facture_btn').setDisabled(false);
                if (callback !== undefined) {
                    callback();
                } else {
                    Ext.Msg.show({
                        title: 'Vinum',
                        msg: Ext.String.format("La facture #{0} a été enregistrée et peut maintenant être téléchargée",
                                               form.curr.no_commande_facture),
                        icon: Ext.MessageBox.INFO,
                        buttons: Ext.MessageBox.OK
                    });                            
                }
            }, this)
        });
    },

    loadClientPart: function(form, no_client) {
        form.down('#nom_social_dd').forceSelection = false;
        form.load({
            url: ajax_url_prefix + '/client/load',
            params: {
                no_client: no_client
            },
            success: Ext.bind(function(_form, action) {
                form.down('#nom_social_dd').forceSelection = true;
                form.down('#details_client_btn').setDisabled(false);
                var r = Ext.create('VIN.model.Client', action.result.data);
                form.curr.client_rec = r; // save client state in form instance
                var adresse = Ext.String.format('{0} {1} {2} {3}', r.get('no_civique')||'<no?>', 
                                                r.get('rue')||'<rue?>', r.get('ville')||'<ville?>',
                                                r.get('code_postal')||'<code_postal?>');
                form.down('#adresse_tf').setValue(adresse);
                this.updateClientProduit(form);
            }, this)
        });
    }

});
