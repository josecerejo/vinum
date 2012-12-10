Ext.define('VIN.controller.MainToolbar', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.MainToolbar', 'VIN.view.MainPanel', 'VIN.view.client.Grid',
            'VIN.view.commande.Form'],
    refs: [{
        ref: 'toolbar',
        selector: 'main_toolbar'
    }, {
        ref: 'main',
        selector: 'main_panel'
    }],

    init: function() {
        this.control({
            'toolbar menuitem': {
                click: function(itm, e, opts) {
                    switch (itm.id) {
                    case 'create_commande_menu_itm':
                        VIN.app.getController('Commande').createCommandeForm();
                        break;
                    case 'edit_client_menu_itm':
                        VIN.app.getController('Client').createClientForm();
                        break;
                    case 'list_clients_menu_itm':
                        var cg = Ext.create('widget.client_grid');
                        cg.store.load();
                        this.getMain().add(cg);
                        this.getMain().setActiveTab(cg);
                        break;
                    };                    
                }
            }
        });
    },

    onLaunch: function() {
        if (initial_tab && window.location.hostname == 'localhost') {
            var t = Ext.create(initial_tab);
            Ext.getCmp('main_pnl').add(t);
            Ext.getCmp('main_pnl').setActiveTab(t);
        }
    }

});
