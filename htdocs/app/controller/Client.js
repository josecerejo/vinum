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
            'list': {
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
            'form button': {
                click: function(btn, e, opts) {
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
        var form = this.getForm();
        var grid = this.getList();
        var store = grid.getStore();
        form.getForm().submit({
            url: ajax_url_prefix + '/client/create',
            success: function(_form, action) {
                var new_no_client = Ext.JSON.decode(action.response.responseText).no_client;
                var new_rec = Ext.create('VIN.model.Client', Ext.override(form.getForm().getFieldValues(), {
                    no_client: new_no_client
                }));
                store.insert(0, new_rec);
                grid.getSelectionModel().select(0);
            }
        });        
    },

    updateClient: function() {
        var form = this.getForm();
        var grid = this.getList();
        var store = grid.getStore();
        if (grid.getSelectionModel().getSelection().length == 0) {
            Ext.Msg.show({
                title: 'Vinum',
                msg: 'Veuillez sélectionner un client',
                icon: Ext.MessageBox.WARNING,
                buttons: Ext.MessageBox.OK
            });                    
            return;
        }
        if (!Ext.getCmp('no_client_tf').getValue()) {
            Ext.Msg.show({
                title: 'Vinum',
                msg: 'Veuillez spécifier un # client',
                icon: Ext.MessageBox.WARNING,
                buttons: Ext.MessageBox.OK
            });                    
            return;
        }
        var sel_rec = grid.getSelectionModel().getSelection()[0];
        var form_values = form.getForm().getFieldValues();
        if (sel_rec.get('no_client') != form_values.no_client) {
            Ext.Msg.show({
                title: 'Vinum',
                msg: "Le # d'un client existant ne peut pas être modifié",
                icon: Ext.MessageBox.WARNING,
                buttons: Ext.MessageBox.OK
            });                    
            return;
        }
        form.getForm().submit({
            url: ajax_url_prefix + '/client/update',
            success: function(_form, action) {
                sel_rec.set(form_values);
                grid.getView().refresh();
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
                    url: ajax_url_prefix + '/client/delete',
                    success: function(_form, action) {
                        store.reload();
                    }
                });
            }
        });        
    }    
});
