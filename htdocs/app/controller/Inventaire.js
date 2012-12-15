Ext.define('VIN.controller.Inventaire', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.inventaire.Form'],
    models: ['VIN.model.Inventaire'],
    stores: ['VIN.store.Inventaires'],

    init: function() {

        this.control({

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('inventaire_form');
    },

    createInventaireForm: function() {
        var ig = Ext.create('widget.inventaire_grid');
        ig.store.load();
        Ext.getCmp('main_pnl').add(ig);
        Ext.getCmp('main_pnl').setActiveTab(ig);
    }

});
