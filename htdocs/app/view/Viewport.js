Ext.define('VIN.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: ['VIN.view.MainPanel'],
    layout: 'border',
    items: [{
        region: 'north',
        items: [{
            xtype: 'toolbar',
            cls: 'header',
            items: {
                xtype: 'component',
                cls: 'title',
                html: 'Prototype Vinum (2012-11-19)'
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
