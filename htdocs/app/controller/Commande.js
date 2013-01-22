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
                beforeclose: function(form) {
                    Ext.Msg.confirm('Vinum', "Voulez-vous sauvegarder cette commande avant de la fermer?",
                                    Ext.bind(function(btn) {
                                        if (btn == 'yes') {
                                            this.saveCommandeFormPart(form, function() {
                                                form.ownerCt.remove(form);
                                            }, 'both'); // will both both created/saved msgs
                                        } else {
                                            form.ownerCt.remove(form);
                                        }
                                    }, this));
                    return false;
                }
            },
            'commande_form #client_dd': {
                select: function(field, records, eopts) {
                    var form = this._getFormViewInstance(field);
                    this.loadClientPartOfCommandeForm(form, records[0].get('no_client'), Ext.bind(this.loadClientPartOfCommmandeFormCallback, this));
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
            '#produit_dd': {
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
                }
            },
            '#add_produit_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var is_valid = true;
                    Ext.Array.each(['#client_dd', '#produit_dd', '#add_produit_qc_nf'], function(item_id) {
                        if (!form.down(item_id).getValue()) {
                            form.down(item_id).markInvalid('Ce champ est requis');
                            is_valid = false;
                        }
                    });
                    if (!is_valid) {
                        return;
                    }
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
                    var nps = rec.get('no_produit_saq');
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit SAQ "{0}" de la commande?', nps),
                                    Ext.bind(function(btn) {
                                        if (btn == 'yes') {
                                            form.submit({
                                                url: ajax_url_prefix + '/commande/remove_item',
                                                params: {
                                                    no_produit_saq: nps
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
                    this.saveCommandeFormPart(form, Ext.bind(function() {
                        var url = Ext.String.format('{0}/commande/download_facture?no_commande_facture={1}&attach=0&_dc={2}',
                                                    ajax_url_prefix, form.down('#no_commande_facture_tf').getValue(),
                                                    Ext.Number.randomInt(1000, 100000));
                        window.open(url, '_blank');
                    }, this));
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
                    this.saveCommandeFormPart(form, Ext.bind(function() {
                        form.email_win.document_type = 'facture';
                        var cdd = form.down('#client_dd');
                        var cr = cdd.findRecordByDisplay(cdd.getValue());
                        var courriel = cr.get('courriel');
                        form.email_win.down('#email_f').getForm().url = ajax_url_prefix + '/commande/email_facture';
                        form.email_win.down('#email_addr_tf').setValue(courriel);
                        form.email_win.down('#email_subject_tf').setValue(Ext.String.format('Facture #{0}',
                                                                                            form.down('#no_commande_facture_tf').getValue()));
                        form.email_win.down('#email_msg_ta').setValue(form.email_msg_facture);
                        if (!courriel) {
                            form.email_win.down('#email_addr_tf').markInvalid("L'adresse courriel de ce client n'est pas définie");
                            Ext.Msg.show({
                                title: 'Vinum',
                                msg: "L'adresse courriel de ce client n'est pas définie",
                                icon: Ext.MessageBox.WARNING,
                                buttons: Ext.MessageBox.OK,
                                fn: function() {
                                    form.email_win.show();
                                }
                            });
                        } else {
                            form.email_win.show();
                        }
                    }, this));
                }
            },
            '#email_bon_de_commande_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.saveCommandeFormPart(form, Ext.bind(function() {
                        form.email_win.document_type = 'bon_de_commande';
                        form.email_win.down('#email_f').getForm().url = ajax_url_prefix + '/commande/email_bdc';
                        form.email_win.down('#email_addr_tf').setValue('commandes.privees@saq.qc.ca');
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
                    if (ef.getForm().isValid()) {
                        wait_mask.show();
                        ef.submit({
                            params: {
                                no_commande_facture: form.down('#no_commande_facture_tf').getValue()
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
                                form.down(Ext.String.format('#email_{0}_btn',
                                                            form.email_win.document_type)).setIconCls('tick-icon');
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
                                            Ext.Ajax.request({
                                                url: ajax_url_prefix + '/commande/delete',
                                                params: {
                                                    no_commande_facture: rec.get('no_commande_facture')
                                                },
                                                success: function(response) {
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
            '#facture_poste_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    form.down('#facture_poste_btn').setIconCls(btn.pressed ? 'tick-icon' : 'poste-icon');
                    Ext.Msg.show({
                        title: 'Vinum',
                        msg: btn.pressed ? "La facture a été envoyée électroniquement à Postes Canada, pour impression suivi d'un envoi par la poste régulière" : 'Il est malheureusement trop tard pour annuler, car la facture est déjà en cours d\'envoi par la poste régulière.',
                        icon: Ext.MessageBox.INFO,
                        buttons: Ext.MessageBox.OK
                    });
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
                    msg: "Quantité disponible insuffisante",
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
                }, this)
            });
        }
    },

    saveCommandeFormPart: function(form, callback, save_status_msg) {
        if (form.getForm().isValid()) {
            var cdd = form.down('#client_dd');
            var cr = cdd.findRecordByDisplay(cdd.getValue());
            var params = {no_client: cr.get('no_client')};
            if (cr.get('mode_facturation') === 'poste') {
                params['facture_est_envoyee'] = form.down('#facture_poste_btn').pressed;
            }
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
                    if (typeof callback !== 'undefined') {
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
                no_client: no_client
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
                var adresse = Ext.String.format('{0} {1} {2} {3}', cr.get('no_civique')||'<no?>',
                                                cr.get('rue')||'<rue?>', cr.get('ville')||'<ville?>',
                                                cr.get('code_postal')||'<code_postal?>');
                form.down('#adresse_tf').setValue(adresse);

                if (typeof callback === 'function') {
                    callback(form, cr);
                }
            }, this)
        });
    },

    loadClientPartOfCommmandeFormCallback: function(form, client_rec, commande_rec) {
        this.loadClientProduits(form);
        form.down('#email_facture_btn').setDisabled(client_rec.get('mode_facturation') === 'poste');
        form.down('#facture_poste_btn').setDisabled(client_rec.get('mode_facturation') === 'courriel');
        // commande_rec might be defined in closure
        console.log('2:', commande_rec);
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
            console.log('1:', commande_rec);
            this.loadClientPartOfCommandeForm(cf, commande_rec.get('no_client'), Ext.bind(this.loadClientPartOfCommmandeFormCallback, this));
            this.loadCommandePartOfCommandeForm(cf, commande_rec);
            cf.setTitle(Ext.String.format('Commande {0}', commande_rec.get('no_commande_facture')));
        } else if (typeof commande_rec_or_no_client !== 'undefined') {
            var no_client = commande_rec_or_no_client;
            this.loadClientPartOfCommandeForm(cf, no_client, Ext.bind(this.loadClientPartOfCommmandeFormCallback, this));
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
                    facture_est_envoyee: 0.05,
                    bon_de_commande_est_envoye: 0.05
                }
            });
            Ext.getCmp('main_pnl').add(cg);
        }
        Ext.getCmp('main_pnl').setActiveTab(cg);
    }

});
