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
                    if (itm.text == 'Créer une commande') {
                        var cf = Ext.create('widget.commande_form');
                        this.getMain().add(cf);
                        this.getMain().setActiveTab(cf);                        
                    } else if (itm.text == 'Voir la liste de clients') {
                        var cg = Ext.create('widget.client_grid');
                        cg.store.load();
                        this.getMain().add(cg);
                        this.getMain().setActiveTab(cg);
                    }
                }
            }
        });
    },

    onLaunch: function() {
        this.getMain().setActiveTab(1);
    }

});
