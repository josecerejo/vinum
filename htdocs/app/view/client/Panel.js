Ext.define('VIN.view.client.Panel', {
    extend: 'Ext.Panel',
    alias: 'widget.client_panel',
    requires: ['VIN.view.client.List'],
    title: 'Clients',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'client_grid',
        flex: .6
    }, {
        xtype: 'client_form',
        flex: .4
    }]
});
