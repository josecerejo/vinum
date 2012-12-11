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
                        var cf = Ext.create('widget.commande_form');
                        var mp = Ext.getCmp('main_pnl');
                        mp.add(cf);
                        mp.setActiveTab(cf);
                        VIN.app.getController('Commande').loadClientPartOfCommandeForm(cf, form.down('#no_client_tf').getValue());
                    });
                }
            },

            'client_form #commande_g': {
                selectionchange: function(model, records) {
                    var form = this._getFormViewInstance(model.view);
                    var cig = form.down('#commande_item_g');
                    cig.store.load({
                        params: {
                            no_commande_facture: records[0].get('no_commande_facture')
                        },
                        callback: Ext.bind(function(recs, op, success) {
                        }, this)
                    });
                }
            },

            'client_grid actioncolumn': {
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le client #{0} de la base de données', 
                                                               rec.get('no_client')), 
                        Ext.bind(function(btn) {
                            if (btn == 'yes') {
                                Ext.Ajax.request({
                                    url: ajax_url_prefix + '/client/delete',
                                    params: {
                                        no_client: rec.get('no_client')
                                    },
                                    success: function(response) {
                                        grid.store.reload();
                                    }
                                });
                            }
                        }, this));
                },
                edit_click: function(grid, el, rowIndex, colIndex, e, record, rowEl) {
                    this.createClientForm(record);
                }
            },

            'client_grid': {
                itemdblclick: function(view, record, item, index, e, eOpts) {
                    this.createClientForm(record);
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
            callback: Ext.bind(function(records, operation, success) {
                form.down('#client_dd').getStore().reload();
            }, this)
        });
        // load client commandes
        form.down('#commande_g').store.load({
            params: {
                is_single_client_query: true,
                query: no_client
            },
            callback: function(records, operation, success) {
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
                                    VIN.app.getController('Commande').loadClientPartOfCommandeForm(tab, no_client, true);
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
        var cg = Ext.create('widget.client_grid');
        cg.store.load();
        Ext.getCmp('main_pnl').add(cg);
        Ext.getCmp('main_pnl').setActiveTab(cg);        
    }

});
