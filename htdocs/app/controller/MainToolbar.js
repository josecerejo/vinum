Ext.define('VIN.controller.MainToolbar', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.MainToolbar', 'VIN.view.MainPanel', 'VIN.view.client.List',
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
                        var cf = Ext.create('widget.commande_form');
                        this.getMain().add(cf);
                        this.getMain().setActiveTab(cf);                        
                        break;
                    case 'edit_client_menu_itm':
                        var cf = Ext.create('widget.client_form');
                        this.getMain().add(cf);
                        this.getMain().setActiveTab(cf);
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
        //this.getMain().setActiveTab(1);
    }

});
