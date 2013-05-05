var ajax_url_prefix = '/vinum_server'; // should correspond to WSGIScriptAlias

Ext.Loader.setConfig({
    enabled: true
});

Ext.application({

    name: 'VinumMobile',
    models: ['Client'],
    stores: ['Clients'],
    views: ['Main'],
    controllers: ['AppController'],

    launch: function() {
        Ext.Viewport.add({
            xclass: 'VinumMobile.view.Main'
        });
    }
});
