/* IMPORTANT: for an important distinction between the "produit" and "item" concepts,
              refer to a note in model.sql, at the level of the commande_item table. */

Ext.define('VIN.controller.Commande', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.commande.Form'],
    models: ['VIN.model.Produit'],
    stores: ['VIN.store.Produits'],

    init: function() {

        this.control({
            'commande_form': {
                // this (confirm msg or not) prevents a bug (Uncaught TypeError: Cannot call method 'apply' of undefined)
                // on Chrome/OSX (why only for this particular tab though?)
                beforeclose: function(form) {
                    form.ownerCt.remove(form);
                    // Ext.Msg.confirm('Vinum', "Voulez-vous sauvegarder cette commande avant de la fermer?",
                    //                 Ext.bind(function(btn) {
                    //                     if (btn == 'yes') {
                    //                         this.saveCommandeFormPart(form, function() {
                    //                             form.ownerCt.remove(form);
                    //                         }, 'both'); // will both both created/saved msgs
                    //                     } else {
                    //                         form.ownerCt.remove(form);
                    //                     }
                    //                 }, this));
                    // return false;
                }
            },
            'commande_form #client_dd': {
                select: function(field, records, eopts) {
                    var form = this._getFormViewInstance(field);
                    this.loadClientPartOfCommandeForm(form, records[0].get('no_client'),
                                                      this.getLoadClientPartOfCommmandeFormCallback(form));
                }
            },
            '#details_client_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var cdd = form.down('#client_dd');
                    var cr = cdd.findRecordByDisplay(cdd.getValue());
                    VIN.app.getController('Client').createClientForm(cr);
                }
            },
            '#direct_df': {
                focus: function(field) {
                    var form = this._getFormViewInstance(field);
                    form.down('#direct_rb').setValue(true);
                }
            },
            'commande_form #succ_dd': {
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
            'commande_form #produit_dd': {
                select: function(field, records, eopts) {
                    var form = this._getFormViewInstance(field);
                    var pdd = form.down('#produit_dd');
                    var pr = pdd.findRecordByDisplay(pdd.getValue());
                    this.updateInventaire(form, pr);
                }
            },
            '#client_produit_g': {
                selectionchange: function(model, records) {
                    if (records.length == 0) { return; }
                    var form = this._getFormViewInstance(model.view);
                    this.updateInventaire(form, records[0]);
                }
            },
            '#client_produit_g actioncolumn': {
                // see: http://mitchellsimoens.com/2012/02/ext-js-4/actioncolumn-and-mvc/
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    this.removeClientProduit(this._getFormViewInstance(grid), grid, rec);
                },
                add_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    var form = this._getFormViewInstance(grid);
                    var desired_qc = rec.get('quantite_caisse');
                    if (desired_qc) {
                        this.addCommandeProduit(form, rec, desired_qc);
                    } else {
                        Ext.Msg.show({
                            title: 'Vinum',
                            msg: "Veuillez spécifier une quantité (en cliquant dans la cellule voulue de la colonne 'Quantité (c)')",
                            icon: Ext.MessageBox.WARNING,
                            buttons: Ext.MessageBox.OK
                        });
                        return;
                    }
                },
            },
            // dont know why adding 'client_produit_grid' (in front of numberfield) does not work here..
            'numberfield': {
                qc_enter_key: function(nf, e) {
                    // http://www.sencha.com/forum/showthread.php?240227-Grid-Cell-Editor-Combobox-get-information-about-Record-row&p=880434&viewfull=1#post880434
                    var grid = nf.up('#client_produit_g');
                    var sel = grid.getSelectionModel().getSelection();
                    var rec = Ext.create('VIN.model.Produit', sel[0].data);
                    var desired_qc = nf.getValue();
                    if (desired_qc) {
                        var form = this._getFormViewInstance(nf);
                        this.addCommandeProduit(form, rec, desired_qc);
                    }
                }
            },
            '#add_produit_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.preAddCommandeProduit(form);
                }
            },
            '#commande_item_g rowactions': {
                groupaction: function(grid, records, action, groupValue) {
                    var form = this._getFormViewInstance(grid);
                    var tv = groupValue;
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit "{0}" de la commande?', tv),
                                    // no need to save commande form part at this point i'm pretty sure
                                    Ext.bind(function(btn) {
                                        if (btn == 'yes') {
                                            form.submit({
                                                url: ajax_url_prefix + '/commande/remove_produit',
                                                params: {
                                                    no_produit_interne: records[0].get('no_produit_interne')
                                                },
                                                success: Ext.bind(function(_form, action) {
                                                    form.down('#commande_item_g').getStore().load();
                                                    // check if inventaire needs update: in the inventaire grid, all rows/recs should
                                                    // correspond to the same produit, so just take the 1rst, if it exists
                                                    var pr = form.down('#inventaire_produit_g').getStore().getAt(0);
                                                    if (pr !== undefined && pr.get('type_vin') === tv) {
                                                        this.updateInventaire(form, pr);
                                                    }
                                                }, this)
                                            });
                                        }
                                    }, this));
                }
            },
            '#commande_item_g actioncolumn': {
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    var form = this._getFormViewInstance(grid);
                    var nps = rec.get('no_produit_saq'); // if statut_item==BO -> nps is null
                    var msg = nps ? Ext.String.format('Êtes-vous certain de vouloir enlever le produit SAQ "{0}" de la commande?', nps) :
                        'Êtes-vous certain de vouloir enlever cet item de la commande?';
                    Ext.Msg.confirm('Vinum', msg,
                                    Ext.bind(function(btn) {
                                        if (btn == 'yes') {
                                            form.submit({
                                                url: ajax_url_prefix + '/commande/remove_item',
                                                params: {
                                                    no_produit_saq: nps,
                                                    no_produit_interne: rec.get('no_produit_interne') // in case nps is null
                                                },
                                                success: Ext.bind(function(_form, action) {
                                                    form.down('#commande_item_g').getStore().load();
                                                    // check if inventaire needs update: in the inventaire grid, all rows/recs should
                                                    // correspond to the same produit, so just take the 1rst, if it exists
                                                    var ir0 = form.down('#inventaire_produit_g').getStore().getAt(0);
                                                    if (ir0 !== undefined && ir0.get('no_produit_interne') === rec.get('no_produit_interne')) {
                                                        this.updateInventaire(form, ir0);
                                                    }
                                                }, this)
                                            });
                                        }
                                    }, this));
                }
            },
            '#preview_facture_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var showPreviewCallback = function() {
                        var url = Ext.String.format('{0}/commande/download_facture?no_commande_facture={1}&attach=0&logo=1&_dc={2}',
                                                    ajax_url_prefix, form.down('#no_commande_facture_tf').getValue(),
                                                    Ext.Number.randomInt(1000, 100000));
                        window.open(url, '_blank');
                    };
                    if (current_user.representant_id) {
                        // if repr, do not save
                        showPreviewCallback();
                    } else {
                        // if admin, save then preview
                        this.saveCommandeFormPart(form, showPreviewCallback);
                    }
                }
            },
            '#preview_bdc_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.saveCommandeFormPart(form, Ext.bind(function() {
                        var url = Ext.String.format('{0}/commande/download_bdc?no_commande_facture={1}&attach=0&_dc={2}',
                                                    ajax_url_prefix, form.down('#no_commande_facture_tf').getValue(),
                                                    Ext.Number.randomInt(1000, 100000));
                        window.open(url, '_blank');
                    }, this));
                }
            },
            '#email_facture_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var popEmailComposeCallback = Ext.bind(function() {
                        form.email_win.document_type = 'facture';
                        var cdd = form.down('#client_dd');
                        var cr = cdd.findRecordByDisplay(cdd.getValue());
                        //var courriel = cr.get('courriel');
                        form.email_win.down('#email_f').getForm().url = ajax_url_prefix + '/commande/email_facture';
                        var emails = [];
                        if (cr.get('courriel')) {
                            emails.push({addr: cr.get('courriel')});
                        }
                        if (cr.get('mode_facturation') === 'courriel' && cr.get('mode_facturation_note') &&
                            cr.get('mode_facturation_note') !== cr.get('courriel')) {
                            emails.push({addr: cr.get('mode_facturation_note')});
                        }
                        form.email_win.down('#email_addr_dd').getStore().removeAll();
                        if (emails.length > 0) {
                            form.email_win.down('#email_addr_dd').getStore().add(emails);
                            form.email_win.down('#email_addr_dd').setValue(emails[0].addr)
                        }
                        form.email_win.down('#email_subject_tf').setValue(Ext.String.format('Facture #{0}',
                                                                                            form.down('#no_commande_facture_tf').getValue()));
                        form.email_win.down('#email_msg_ta').setValue(form.email_msg_facture);
                        if (emails.length === 0) {
                            form.email_win.down('#email_addr_dd').setValue('');
                            form.email_win.down('#email_addr_dd').markInvalid("Aucune adresse courriel n'a été définie pour ce client");
                            Ext.Msg.show({
                                title: 'Vinum',
                                msg: "Aucune adresse courriel n'a été définie pour ce client",
                                icon: Ext.MessageBox.WARNING,
                                buttons: Ext.MessageBox.OK,
                                fn: function() {
                                    form.email_win.show();
                                }
                            });
                        } else {
                            form.email_win.show();
                        }
                    }, this);

                    // if representant, don't save commande, pop email compose dialog right away
                    if (current_user.representant_id) {
                        popEmailComposeCallback();
                    } else {
                        this.saveCommandeFormPart(form, popEmailComposeCallback);
                    }
                }
            },
            '#email_bon_de_commande_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.saveCommandeFormPart(form, Ext.bind(function() {
                        form.email_win.document_type = 'bon_de_commande';
                        form.email_win.down('#email_f').getForm().url = ajax_url_prefix + '/commande/email_bdc';
                        form.email_win.down('#email_addr_dd').setValue('commandes.privees@saq.qc.ca');
                        form.email_win.down('#email_subject_tf').setValue(Ext.String.format('Bon de commande pour la facture #{0}',
                                                                                            form.down('#no_commande_facture_tf').getValue()));
                        form.email_win.down('#email_msg_ta').setValue(form.email_msg_bdc);
                        form.email_win.show();
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
                    var ef = ew.down('#email_f');
                    var ncf = form.down('#no_commande_facture_tf').getValue();
                    if (ef.getForm().isValid()) {
                        wait_mask.show();
                        ef.submit({
                            params: {
                                no_commande_facture: ncf
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
                                if (ew.document_type === 'facture') {
                                    form.down('#facture_est_envoyee_hidden').setValue('true');
                                    // if the user is a repr, we need to set the commande.facture_est_envoyee
                                    // using this separated proc, given that saveCommande wasn't used
                                    if (current_user.representant_id) {
                                        form.submit({
                                            url: ajax_url_prefix + '/representant/set_facture_est_envoyee',
                                            params: {
                                                no_commande_facture: form.down('#no_commande_facture_tf').getValue()
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            },
            '#commande_item_g': {
                edit: function(editor, e) {
                    var form = this._getFormViewInstance(editor.grid);
                    var ir = e.record;
                    form.submit({
                        url: ajax_url_prefix + '/commande/update_item',
                        params: {
                            item: Ext.JSON.encode(ir.data)
                        },
                        success: Ext.bind(function(_form, action) {
                            ir.set('montant_commission', action.result.data.montant_commission);
                        }, this)
                    });
                }
            },
            '#commande_g': {
                itemdblclick: function(view, record, item, index, e, eOpts) {
                    this.createCommandeForm(record);
                },

            },
            '#commande_g actioncolumn': {
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir détruire la commande {0}?' +
                                                               ' (si oui, l\'inventaire sera remis à jour)',
                                                               rec.get('no_commande_facture')),
                                    Ext.bind(function(btn) {
                                        if (btn == 'yes') {
                                            // I use a dummy form here just to avoid using Ext.Ajax.request,
                                            // which plays less well with my general error handlers
                                            var dummy_form = Ext.create('Ext.form.Panel');
                                            dummy_form.submit({
                                                url: ajax_url_prefix + '/commande/delete',
                                                params: {
                                                    no_commande_facture: rec.get('no_commande_facture')
                                                },
                                                success: function(form, action) {
                                                    grid.getStore().load();
                                                }
                                            });
                                        }
                                    }, this));
                },
                edit_click: function(grid, el, rowIndex, colIndex, e, record, rowEl) {
                    this.createCommandeForm(record);
                }
            },
            '#commande_grid_add_btn': {
                click: function(btn) {
                    this.createCommandeForm();
                }
            },
            '#facture_print_logo_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.printFacture(form, true);
                }
            },
            '#facture_print_no_logo_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.printFacture(form, false);
                }
            },
            '#save_commande_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.saveCommandeFormPart(form, Ext.emptyFn, 'both');
                }
            },
            '#add_produit_qc_nf': {
                specialkey: function(tf, e, eOpts) {
                    if (e.getKey() === e.ENTER) {
                        var form = this._getFormViewInstance(tf);
                        this.preAddCommandeProduit(form);
                    }
                }
            },
            '#commande_g #nom_social_external_filter_tf': {
                change: function(field, e, opts) {
                    var g = field.up('#commande_g');
                    VIN.view.Grid.applyExternalGridFilter(g, field, 'nom_social');
                }
            }
        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('commande_form');
    },

    loadClientProduits: function(form) {
        var cdd = form.down('#client_dd');
        var cr = cdd.findRecordByDisplay(cdd.getValue());
        // bind this inventaire grid to this particular produit, so that every operation
        // on it (filter, sort, etc) remembers to take it into consideration
        var cpg = form.down('#client_produit_g');
        //cpg.getStore().getProxy().extraParams = {
        cpg.store.proxy.extraParams = {
            no_client: cr.get('no_client')
        };
        cpg.getStore().load();
    },

    removeClientProduit: function(form, grid, produit_rec) {
        Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit "{0}" de la liste de produits habituels de ce client?',
                                                   produit_rec.get('type_vin')),
                        Ext.bind(function(btn) {
                            if (btn == 'yes') {
                                var cdd = form.down('#client_dd');
                                var cr = cdd.findRecordByDisplay(cdd.getValue());
                                form.submit({
                                    url: ajax_url_prefix + '/client/remove_produit',
                                    params: {
                                        no_client: cr.get('no_client'),
                                        no_produit_interne: produit_rec.get('no_produit_interne')
                                    },
                                    success: function(_form, action) {
                                        grid.getStore().load();
                                    }
                                });
                            }
                        }, this));
    },

    updateInventaire: function(form, produit_rec) {
        var ig = form.down('#inventaire_produit_g');
        // hmm this is only way I found working to preserve selection of the inv grid
        // upon reload: (1) get selected recs
        var inv_sel = ig.getSelectionModel().getSelection();
        // (2) build a list of the no_produit_saq ids
        var inv_sel_nps = [];
        Ext.Array.each(inv_sel, function(rec) {
            inv_sel_nps.push(rec.get('no_produit_saq'));
        });
        // bind this inventaire grid to this particular produit, so that every operation
        // on it (filter, sort, etc) remembers to take it into consideration
        ig.getStore().getProxy().extraParams = {
            no_produit_interne: produit_rec.get('no_produit_interne')
        };
        ig.getStore().load({
            callback: function(records, operation, success) {
                // reset selection state before load
                if (operation) {
                    // (3) query updated store to retrieve recs matching (2)
                    var inv_sel = ig.getStore().queryBy(function(rec, id) {
                        return Ext.Array.contains(inv_sel_nps, rec.get('no_produit_saq'));
                    });
                    // (4) select those..
                    ig.getSelectionModel().select(inv_sel.items);
                }
            }
        });
        ig.setTitle(Ext.String.format('Inventaire pour le produit "{0}"', produit_rec.get('type_vin')));
    },

    // will first ask to include product in preferred list before adding it
    preAddCommandeProduit: function(form) {
        var is_valid = true;
        Ext.Array.each(['#client_dd', '#produit_dd', '#add_produit_qc_nf'], function(item_id) {
            if (!form.down(item_id).getValue()) {
                form.down(item_id).markInvalid('Ce champ est requis');
                is_valid = false;
            }
        });
        if (!is_valid) { return; }
        var desired_qc = form.down('#add_produit_qc_nf').getValue();
        var pdd = form.down('#produit_dd');
        var pr = pdd.findRecordByDisplay(pdd.getValue());
        var cpg = form.down('#client_produit_g');
        var produit = pdd.getValue();
        if (!cpg.getStore().findRecord('type_vin', produit)) {
            var msg = Ext.String.format('Voulez-vous ajouter le produit "{0}" à la liste de produits habituels de ce client?', produit);
            Ext.Msg.confirm('Vinum', msg, Ext.bind(function(btn) {
                if (btn == 'yes') {
                    var cdd = form.down('#client_dd');
                    var cr = cdd.findRecordByDisplay(cdd.getValue());
                    form.submit({
                        url: ajax_url_prefix + '/client/add_produit',
                        params: {
                            no_client: cr.get('no_client')
                        },
                        success: Ext.bind(function(_form, action) {
                            cpg.getStore().load(); // reload doesn't seem to work here, don't understand why!
                            this.addCommandeProduit(form, pr, desired_qc);
                        }, this)
                    });
                } else {
                    this.addCommandeProduit(form, pr, desired_qc);
                }
            }, this));
        } else {
            this.addCommandeProduit(form, pr, desired_qc);
        }
    },

    // this saves the commande form part and add the desired produit in the same submit
    addCommandeProduit: function(form, produit_rec, desired_qc) {
        var ig = form.down('#inventaire_produit_g');
        var cig = form.down('#commande_item_g');
        if (form.getForm().isValid()) {
            var ig = form.down('#inventaire_produit_g');
            var inv_sel = ig.getSelectionModel().getSelection();
            var inv_sel_nps = [];
            var sel_qc_avail = 0;
            Ext.Array.each(inv_sel, function(rec) {
                inv_sel_nps.push(rec.get('no_produit_saq'));
                sel_qc_avail += rec.get('solde_caisse');
            });
            if (inv_sel.length && desired_qc > sel_qc_avail) {
                Ext.Msg.show({
                    title: 'Vinum',
                    msg: "Quantité disponible insuffisante (pour cet item d'inventaire particulier)",
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.MessageBox.OK
                });
                return;
            }
            var cdd = form.down('#client_dd');
            var cr = cdd.findRecordByDisplay(cdd.getValue());
            form.submit({
                url: ajax_url_prefix + '/commande/add_produit',
                params: {
                    // no_commande_facture is not necessarily defined at this point
                    no_client: cr.get('no_client'),
                    no_produit_interne: produit_rec.get('no_produit_interne'),
                    qc: desired_qc,
                    nps_constraint: inv_sel_nps
                },
                success: Ext.bind(function(_form, action) {
                    var ncf = action.result.data.no_commande_facture;
                    if (form.down('#no_commande_facture_tf').getValue() === '') {
                        Ext.Msg.show({
                            title: 'Vinum',
                            msg: Ext.String.format("La commande #{0} a été créée", ncf),
                            icon: Ext.MessageBox.INFO,
                            buttons: Ext.MessageBox.OK
                        });
                    }
                    form.loadRecord(action.result); // to load no_commande_facture_tf
                    form.setTitle(Ext.String.format('Commande {0}', ncf));
                    this.updateInventaire(form, produit_rec);
                    var cig = form.down('#commande_item_g');
                    cig.getStore().getProxy().extraParams = {
                        no_commande_facture: form.down('#no_commande_facture_tf').getValue()
                    };
                    cig.getStore().load();
                    // check for existing backorder (msg from server)
                    if (action.result.data.backorder !== undefined) {
                        // if found, pop the BO window to allow its edition
                        var bo_rec = Ext.create('VIN.model.Backorder', action.result.data.backorder);
                        VIN.app.getController('Backorder').editBO(bo_rec, 'BO existant pour ce client/produit');
                    }
                }, this)
            });
        }
    },

    saveCommandeFormPart: function(form, callback, save_status_msg) {
        if (form.getForm().isValid()) {
            var cdd = form.down('#client_dd');
            var cr = cdd.findRecordByDisplay(cdd.getValue());
            var params = {no_client: cr.get('no_client')};
            form.submit({
                url: ajax_url_prefix + '/commande/save',
                params: params,
                success: Ext.bind(function(_form, action) {
                    var was_created = form.down('#no_commande_facture_tf').getValue() == '';
                    form.loadRecord(action.result); // to load no_commande_facture_tf
                    var ncf = action.result.data.no_commande_facture;
                    form.setTitle(Ext.String.format('Commande {0}', ncf));
                    if (typeof save_status_msg !== 'undefined') {
                        if (save_status_msg === 'both' || (save_status_msg === 'creation' && was_created)) {
                            Ext.Msg.show({
                                title: 'Vinum',
                                msg: Ext.String.format("La commande #{0} a été {1}",
                                                       ncf, was_created ? 'créée' : 'sauvegardée'),
                                icon: Ext.MessageBox.INFO,
                                buttons: Ext.MessageBox.OK
                            });
                        }
                    }
                    if (typeof callback === 'function') {
                        callback();
                    }
                }, this)
            });
        }
    },

    loadClientPartOfCommandeForm: function(form, no_client, callback) {
        var cdd = form.down('#client_dd');
        cdd.forceSelection = false;
        form.load({
            url: ajax_url_prefix + '/client/load',
            params: {
                no_client: no_client,
                format_note: true // since the note_client field is one-line, replace \n's by spaces
            },
            success: Ext.bind(function(_form, action) {
                cdd.forceSelection = true;
                var cr = Ext.create('VIN.model.Client', action.result.data);
                /* Even though the form.load above have filled #client_dd with a proper value, it hasn't
                   loaded it with a full client record, which is needed throughout the client controller,
                   because the commande form itself doesn't contain the full set of client fields; for this
                   purpose, we load the client rec returned by form.load into its store, using loadData()
                 */
                cdd.getStore().loadData([cr]);
                form.down('#details_client_btn').setDisabled(false);
                var adresse = Ext.String.format('{0} {1} {2} {3}', cr.get('no_civique')||'', cr.get('rue')||'',
                                                cr.get('ville')||'', cr.get('code_postal')||'');
                form.down('#adresse_tf').setValue(adresse);
                if (typeof callback === 'function') {
                    callback(form, cr);
                }
            }, this)
        });
    },

    // returns closure on commande_rec, callable with client_rec
    getLoadClientPartOfCommmandeFormCallback: function(form, commande_rec) {
        return Ext.bind(function(form, client_rec) {
            this.loadClientProduits(form);
            /*
            form.down('#email_facture_btn').setDisabled(client_rec.get('mode_facturation') === 'poste');
            form.down('#facture_poste_btn').setDisabled(client_rec.get('mode_facturation') === 'courriel');
            // commande_rec might or might not have been defined (by the close creation call)
            if (typeof commande_rec !== 'undefined') {
                if (commande_rec.get('facture_est_envoyee')) {
                    if (client_rec.get('mode_facturation') === 'courriel') {
                        form.down('#email_facture_btn').setIconCls('tick-icon');
                    } else {
                        form.down('#facture_poste_btn').setIconCls('tick-icon');
                        form.down('#facture_poste_btn').toggle();
                    }
                }
                if (commande_rec.get('bon_de_commande_est_envoye')) {
                    form.down('#email_bon_de_commande_btn').setIconCls('tick-icon');
                }
            }
            */
        }, this);
    },

    loadCommandePartOfCommandeForm: function(form, commande_rec) {
        form.load({
            url: ajax_url_prefix + '/commande/load',
            params: {
                no_commande_facture: commande_rec.get('no_commande_facture')
            },
            success: Ext.bind(function(_form, action) {
            }, this)
        });
        /* ??? there's something I really don't understand here: since commande_rec is
           already in the state we want, we should be able to simply load the form with it,
           using form.loadRecord, instead of doing the above ajax call; but for some reason
           it doesn't play well with the "expedition" rbg
        */
        //form.loadRecord(commande_rec); <-- doesn't work.. why?
        var cig = form.down('#commande_item_g');
        cig.getStore().getProxy().extraParams = {
            no_commande_facture: commande_rec.get('no_commande_facture')
        };
        cig.getStore().load();
    },

    createCommandeForm: function(commande_rec_or_no_client) {
        var cf = Ext.create('widget.commande_form');
        var mp = Ext.getCmp('main_pnl');
        mp.add(cf);
        mp.setActiveTab(cf);
        if (typeof commande_rec_or_no_client === 'object') {
            var commande_rec = commande_rec_or_no_client;
            this.loadClientPartOfCommandeForm(cf, commande_rec.get('no_client'),
                                              this.getLoadClientPartOfCommmandeFormCallback(cf, commande_rec));
            this.loadCommandePartOfCommandeForm(cf, commande_rec);
            cf.setTitle(Ext.String.format('Commande {0}', commande_rec.get('no_commande_facture')));
        } else if (typeof commande_rec_or_no_client !== 'undefined') {
            var no_client = commande_rec_or_no_client;
            this.loadClientPartOfCommandeForm(cf, no_client, this.getLoadClientPartOfCommmandeFormCallback(cf));
        }
    },

    createCommandeGrid: function() {
        var cg = Ext.getCmp('main_pnl').down('#commande_g');
        if (!cg) {
            cg = Ext.create('VIN.view.Grid', {
                itemId: 'commande_g',
                title: 'Commandes',
                closable: true,
                add_edit_actioncolumn: true,
                add_delete_actioncolumn: true,
                store: Ext.create('VIN.store.Commandes'),
                column_flex: {
                    no_commande_facture: 0.1,
                    no_commande_saq: 0.1,
                    no_client: 0.1,
                    no_client_saq: 0.1,
                    nom_social: 0.3,
                    date_commande: 0.1,
                    date_envoi_saq: 0.1,
                    note_commande: 0.15,
                    facture_est_envoyee: 0.05,
                    bon_de_commande_est_envoye: 0.05,
                    bon_de_commande_heure_envoi: 0.11
                },
                dockedItems: {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [{
                        text: 'Créer une commande',
                        iconCls: 'add-icon',
                        itemId: 'commande_grid_add_btn'
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'clearabletextfield',
                        enableKeyEvents: true,
                        emptyText: 'Filtrer les clients (par nom social)',
                        itemId: 'nom_social_external_filter_tf',
                        width: 250
                    }]
                }
            });
            Ext.getCmp('main_pnl').add(cg);
        }
        Ext.getCmp('main_pnl').setActiveTab(cg);
    },

    printFacture: function(form, with_logo) {
        var popPrintDialogCallback = function() {
            var url = Ext.String.format('{0}/commande/download_facture?no_commande_facture={1}&attach=0&logo={2}&_dc={3}',
                                        ajax_url_prefix, form.down('#no_commande_facture_tf').getValue(),
                                        with_logo ? '1' : '0', Ext.Number.randomInt(1000, 100000));
            window.open(url).print();
        };
        form.down('#facture_est_envoyee_hidden').setValue('true');
        if (current_user.representant_id) {
            popPrintDialogCallback();
            // if the user is a repr, we need to set the commande.facture_est_envoyee
            // using this separated proc, given that saveCommande wasn't used
            form.submit({
                url: ajax_url_prefix + '/representant/set_facture_est_envoyee',
                params: {
                    no_commande_facture: form.down('#no_commande_facture_tf').getValue()
                }
            });
        } else {
            this.saveCommandeFormPart(form, popPrintDialogCallback);
        }
    }

});
