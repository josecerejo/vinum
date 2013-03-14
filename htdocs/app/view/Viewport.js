Ext.define('VIN.view.Viewport', {

    extend: 'Ext.container.Viewport',
    requires: ['VIN.view.MainPanel'],
    layout: 'border',
    items: [{
        region: 'north',
        border: false,
        items: [{
            xtype: 'toolbar',
            cls: 'header',
            items: {
                xtype: 'component',
                cls: 'title',
                html: Ext.String.format('Prototype Vinum (code: {0}, données: 2013-03-14)', last_update)
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
