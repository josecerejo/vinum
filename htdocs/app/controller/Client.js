Ext.define('VIN.controller.Client', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.client.Form'],
    models: ['VIN.model.Client'],
    stores: ['VIN.store.Clients'],

    init: function() {

        this.control({

            'client_form #nom_social_dd': {
                select: function(field, records, eopts) {
                    var form = this._getFormViewInstance(field);
                    var no_client = records[0].get('no_client');
                    this.loadClientForm(form, no_client);
                },
            },

            'client_form #save_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.saveClientForm(form);
                }
            },

            'client_form #succ_dd': {
                focus: function(field) {
                    var form = this._getFormViewInstance(field);
                    form.down('#succ_rb').setValue(true);
                }
            },

            'client_form #copy_addr_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    Ext.Array.forEach(['no_civique', 'rue', 'ville', 'province', 'code_postal'], function(item) {
                        var src = form.down(Ext.String.format('#{0}_tf', item));
                        var dst = form.down(Ext.String.format('#{0}_fact_tf', item));
                        dst.setValue(src.getValue());
                    });
                }
            },

            'client_form #create_commande_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.saveClientForm(form, function() {
                        VIN.app.getController('Commande').createCommandeForm(form.down('#no_client_tf').getValue());
                    });
                }
            },

            'client_form #commande_g': {
                selectionchange: function(model, records) {
                    if (records.length == 0) {
                        return;
                    }
                    var form = this._getFormViewInstance(model.view);
                    var cig = form.down('#commande_item_g');
                    cig.getStore().getProxy().extraParams = {
                        no_commande_facture: records[0].get('no_commande_facture')
                    };
                    cig.getStore().load();
                }
            },

            '#client_g actioncolumn': {
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le client #{0} de la base de données',
                                                               rec.get('no_client')),
                        Ext.bind(function(btn) {
                            if (btn == 'yes') {
                                // I use a dummy form here just to avoid using Ext.Ajax.request,
                                // which plays less well with my general error handlers
                                var dummy_form = Ext.create('Ext.form.Panel');
                                dummy_form.submit({
                                    url: ajax_url_prefix + '/client/delete',
                                    params: {
                                        no_client: rec.get('no_client')
                                    },
                                    success: function(form, action) {
                                        grid.store.load();
                                    }
                                });
                            }
                        }, this));
                },
                edit_click: function(grid, el, rowIndex, colIndex, e, record, rowEl) {
                    this.createClientForm(record);
                }
            },

            '#client_g': {
                itemdblclick: function(view, record, item, index, e, eOpts) {
                    this.createClientForm(record);
                }
            },

            '#client_g #nom_social_external_filter_tf': {
                keyup: function(tf, e, opts) {
                    var g = tf.up('#client_g');
                    var ns_filter = g.filters.getFilter('nom_social');
                    if (tf.getValue()) {
                        ns_filter.setValue(tf.getValue());
                        ns_filter.setActive(true);
                    } else {
                        ns_filter.setValue('');
                        ns_filter.setActive(false);
                    }
                }
            },

            '#client_grid_add_btn': {
                click: function(btn) {
                    this.createClientForm();
                }
            }

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('client_form');
    },

    createClientForm: function(client_rec) {
        var cf = Ext.create('widget.client_form');
        var mp = Ext.getCmp('main_pnl');
        mp.add(cf);
        mp.setActiveTab(cf);
        if (client_rec !== undefined) {
            this.loadClientForm(cf, client_rec.get('no_client'));
        }
    },

    loadClientForm: function(form, no_client) {
        // load client form
        form.load({
            url: ajax_url_prefix + '/client/load',
            params: {
                no_client: no_client
            },
            success: function(_form, action) {

                // I guess this was never user (it was im "callback", instead of "success",
                // which doesn't exist for a form.load); but anyway I'll let it here for a while
                //form.down('#client_dd').getStore().load();

                var cg = form.down('#commande_g');
                // bind this commande grid to this particular client, so that every operation
                // on it (filter, sort, etc) remembers to take it into consideration
                cg.getStore().getProxy().extraParams = {
                    no_client: no_client
                };
                // load client commandes
                cg.getStore().load();
            }
        });
    },

    saveClientForm: function(form, callback) {
        if (form.getForm().isValid()) {
            form.submit({
                url: ajax_url_prefix + '/client/save',
                success: function(_form, action) {
                    var client_rec = Ext.create('VIN.model.Client', action.result.data);
                    var no_client = client_rec.get('no_client');
                    var mp = Ext.getCmp('main_pnl');
                    // cycle through every tab: if a commande_form is found and it's loaded with
                    // this client, update its values (and importantly, let the user know)
                    for (var i = 0; i < mp.items.length; i++) {
                        var tab =  mp.items.getAt(i);
                        if (tab.xtype == 'commande_form') {
                            var cdd = tab.down('#client_dd');
                            if (cdd.getValue()) {
                                var cr = cdd.findRecordByDisplay(cdd.getValue());
                                if (cr.get('no_client') == no_client) {
                                    // 3rd bool arg: don't reload client produits
                                    VIN.app.getController('Commande').loadClientPartOfCommandeForm(tab, no_client, function(form, client_rec) {
                                        form.down('#email_facture_btn').setDisabled(client_rec.get('mode_facturation') === 'poste');
                                        form.down('#facture_poste_btn').setDisabled(client_rec.get('mode_facturation') === 'courriel');
                                    });
                                }
                            }
                        }
                    }
                    if (callback !== undefined) {
                        callback();
                    } else {
                        Ext.Msg.show({
                            title: 'Vinum',
                            msg: Ext.String.format("Le client #{0} a été {1}{2}", no_client,
                                                   form.down('#no_client_tf').getValue() ? 'modifié' : 'créé',
                                                   form.down('#no_client_tf').getValue() ? ' (ainsi que tous les onglets qui y font référence)' : ''),
                            icon: Ext.MessageBox.WARNING,
                            buttons: Ext.MessageBox.OK
                        });
                    }
                    form.down('#no_client_tf').setValue(no_client);
                }
            });
        }
    },

    createClientGrid: function() {
        var cg = Ext.getCmp('main_pnl').down('#client_g');
        if (!cg) {
            cg = Ext.create('VIN.view.Grid', {
                itemId: 'client_g',
                title: 'Clients',
                closable: true,
                store: Ext.create('VIN.store.Clients'),
                add_edit_actioncolumn: true,
                add_delete_actioncolumn: true,
                column_flex: {
                    no_client: 0.1,
                    no_client_saq: 0.1,
                    nom_social: 0.4,
                    representant_nom: 0.15,
                    expedition: 0.1,
                    mode_facturation: 0.1,
                    mode_facturation_note: 0.1,
                    date_ouverture_dossier: 0.1
                },
                dockedItems: {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [{
                        text: 'Créer un client',
                        iconCls: 'add-icon',
                        itemId: 'client_grid_add_btn'
                    }, {
                        xtype: 'textfield',
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

    downloadBottinRepr: function() {
        var url = Ext.String.format('{0}/representant/download_bottin?_dc={1}',
                                    ajax_url_prefix, Ext.Number.randomInt(1000, 100000));
        window.open(url, '_blank');
    }

});
