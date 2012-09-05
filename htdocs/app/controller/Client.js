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
                    }
                }                
            },
            'client_form button': {
                click: function(btn, e, eopts) {
                    if (btn.text == 'Créer') {
                        this.createClient();
                    } else if (btn.text == 'Modifier') {
                        this.updateClient();
                    }
                }
            }
        });
    },
    createClient: function() {
    },
    updateClient: function() {
        // todo: keep selection
        var that = this;
        this.getForm().getForm().submit({
            success: function(form, action) {
                that.getList().getStore().reload();
            },
            failure: function(form, action) {
                VIN.utils.serverErrorPopup(action.result.error_msg);
            }
        });
    }
});
