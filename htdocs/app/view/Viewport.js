Ext.define('VIN.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: ['VIN.view.LeftNavPanel',
               'VIN.view.MainPanel'],
    layout: 'border',
    items: [{
        region: 'north',
        items: Ext.create('Ext.Toolbar', {
            cls: 'header',
            items: {
                xtype: 'component',
                cls: 'title',
                html: 'Vinum (prototype - 2012-09-06)'
            }
        })
    }, {
        region: 'center',
        xtype: 'main_panel'
    }, {
        region: 'west',
        width: 150,
        xtype: 'left_nav_panel'
    }],
    initComponent: function() {
        this.callParent(arguments);
    }
});
