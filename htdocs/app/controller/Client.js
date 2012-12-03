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
                    // load client form
                    form.load({
                        url: ajax_url_prefix + '/client/load',
                        params: {
                            no_client: no_client
                        }
                    });
                    // load client commandes
                    form.down('#commande_grid').store.load({
                        params: {
                            query: no_client
                        },
                        callback: function(records, operation, success) {
                        }
                    });

                },
            },

            'client_form #save_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    this.saveClient(form);
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
                    this.saveClient(form, function() {
                        var cf = Ext.create('widget.commande_form');
                        var mp = Ext.getCmp('main_pnl');
                        mp.add(cf);
                        mp.setActiveTab(cf);
                        VIN.app.getController('Commande').loadClientPart(cf, form.down('#no_client_tf').getValue());
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
                    this.openClient(record);
                }
            },

            'client_grid': {
                itemdblclick: function(view, record, item, index, e, eOpts) {
                    this.openClient(record);
                }
            }            

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('client_form');
    },

    openClient: function(client_rec) {
        var cf = Ext.create('widget.client_form');
        var mp = Ext.getCmp('main_pnl');
        mp.add(cf);
        mp.setActiveTab(cf);
        cf.load({
            url: ajax_url_prefix + '/client/load',
            params: {
                no_client: client_rec.get('no_client')
            }
        });        
    },

    saveClient: function(form, callback) {
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
                            if (tab.curr.client_rec !== undefined &&
                                tab.curr.client_rec.get('no_client') == no_client) {
                                // 3rd bool arg: don't reload client produits
                                VIN.app.getController('Commande').loadClientPart(tab, no_client, true);
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
                                                   form.down('#no_client_tf').getValue() ? ' (et tous les onglets qui y font référence également)' : ''),
                            icon: Ext.MessageBox.WARNING,
                            buttons: Ext.MessageBox.OK
                        });                                                                
                    }
                    form.down('#no_client_tf').setValue(no_client);
                }
            });
        }
    }
});
