Ext.define('VIN.controller.Client', {
    extend: 'Ext.app.Controller',
    views: ['VIN.view.client.List', 'VIN.view.client.Edit'],
    models: ['VIN.model.Client'],
    stores: ['VIN.store.Clients'],
    refs: [{
        ref: 'list',
        selector: 'client_grid'
    }, {
        ref: 'form',
        selector: 'client_form'
    }],
    init: function() {
        this.control({
            'client_grid': {
                viewready: function(g) {
                    //g.getSelectionModel().select(0);
                },                
                selectionchange: function(model, records) {
                    if (records[0]) {
                        this.getForm().getForm().loadRecord(records[0]);
                    } else {
                        this.getForm().getForm().reset();
                    }
                }                
            },
            'client_form button': {
                click: function(btn, e, eopts) {
                    if (btn.text == 'Créer') {
                        this.createClient();
                    } else if (btn.text == 'Modifier') {
                        this.updateClient();
                    } else if (btn.text == 'Détruire') {
                        this.deleteClient();
                    }
                }
            }
        });
    },
    createClient: function() {
        if (Ext.getCmp('no_client_tf').getValue()) {
            Ext.Msg.show({
                title: 'Vinum',
                msg: "Le # d'un nouveau client est assigné par le système (le champ doit être vide)",
                icon: Ext.MessageBox.WARNING,
                buttons: Ext.MessageBox.OK
            });                    
            return;
        }
        var grid = this.getList();
        var store = grid.getStore();
        this.getForm().getForm().submit({
            url: '/vinum_server/client/create',
            success: function(form, action) {
                store.reload(Ext.apply(store.lastOptions, {
                    callback: function(records, options) {
                        //var new_sel_rec = store.findRecord('no_client', sel_rec.get('no_client'));
                        //grid.getSelectionModel().select(new_sel_rec.index);
                    }
                }));
            },
            failure: function(form, action) {
                VIN.utils.serverErrorPopup(action.result.error_msg);
            }
        });        
    },
    updateClient: function() {
        if (!Ext.getCmp('no_client_tf').getValue()) {
            Ext.Msg.show({
                title: 'Vinum',
                msg: 'Veuillez spécifier un # client',
                icon: Ext.MessageBox.WARNING,
                buttons: Ext.MessageBox.OK
            });                    
            return;
        }
        var grid = this.getList();
        var store = grid.getStore();
        var sel_rec = grid.getSelectionModel().getSelection()[0];
        this.getForm().getForm().submit({
            url: '/vinum_server/client/update',
            success: function(form, action) {
                store.reload(Ext.apply(store.lastOptions, {
                    callback: function(records, options) {
                        var new_sel_rec = store.findRecord('no_client', sel_rec.get('no_client'));
                        grid.getSelectionModel().select(new_sel_rec.index);
                    }
                }));
            },
            failure: function(form, action) {
                VIN.utils.serverErrorPopup(action.result.error_msg);
            }
        });
    },
    deleteClient: function() {
        var form = this.getForm();
        var grid = this.getList();
        var store = grid.getStore();
        if (grid.getSelectionModel().getSelection().length == 0) {
            return;
        }
        var sel_rec = grid.getSelectionModel().getSelection()[0];
        Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir détruire le client # {0}?', sel_rec.get('no_client')), function(btn) {
            if (btn == 'yes') {
                form.getForm().submit({
                    url: '/vinum_server/client/delete',
                    success: function(form, action) {
                        store.reload(Ext.apply(store.lastOptions, {
                            callback: function(records, options) {
                                //var new_sel_rec = store.findRecord('no_client', sel_rec.get('no_client'));
                                //grid.getSelectionModel().select(new_sel_rec.index);
                            }
                        }));
                    },
                    failure: function(form, action) {
                        VIN.utils.serverErrorPopup(action.result.error_msg);
                    }
                });
            }
        });        
    }    
});
