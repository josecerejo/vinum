Ext.define('VIN.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: ['VIN.view.LeftNavPanel',
               'VIN.view.MainPanel'],
    layout: 'border',
    items: [{
        region: 'north',
        items: [{
            xtype: 'toolbar',
            cls: 'header',
            items: {
                xtype: 'component',
                cls: 'title',
                html: 'Vinum (prototype - 2012-09-12)'
            }            
        }, {
            xtype: 'main_toolbar'
        }]
    }, {
        region: 'center',
        xtype: 'main_panel'
    }],
    initComponent: function() {
        this.callParent(arguments);
    }
});
