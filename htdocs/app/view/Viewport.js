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
                html: 'Prototype Vinum (code: 2012-12-21, données: 2012-12-11)'
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
