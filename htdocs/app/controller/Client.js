Ext.define('VIN.controller.Client', {
    extend: 'Ext.app.Controller',
    views: ['VIN.view.client.List', 'VIN.view.client.Edit'],
    models: ['VIN.model.Client'],
    stores: ['VIN.store.Clients'],
    refs: [{
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
            }
        });
    }
});
