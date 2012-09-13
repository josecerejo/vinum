Ext.define('VIN.controller.MainToolbar', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.MainToolbar', 
            'VIN.view.MainPanel',
            'VIN.view.client.List'],
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
                        
                    } else if (itm.text == 'Voir la liste de clients') {
                        var cg = Ext.create('widget.client_grid');
                        this.getMain().add(cg);
                        this.getMain().setActiveTab(cg);
                    }
                }
            }
        });
    }

});
