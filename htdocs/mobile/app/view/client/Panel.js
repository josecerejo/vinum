Ext.define('VinumMobile.view.client.Panel', {
    extend: 'Ext.Panel',
    xtype: 'client_panel',
    config: {
        fullscreen: true,
        layout: 'fit',
        items: [{
            xtype: 'toolbar',
            docked: 'top',
            items: [{
                xtype: 'spacer'
            }, {
                xtype: 'searchfield',
                itemId: 'client_sf',
                placeHolder: 'Recherche...'
            }, {
                xtype: 'spacer'
            }]
        }, {
            xtype: 'client_list'
        }]
    }
});
