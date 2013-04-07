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
                id: 'main_header',
                cls: 'title',
                componentCls: 'main_header',
                // html: '<span>' +  Ext.String.format('Prototype Vinum (code: {0}, données: 2013-03-15)', last_update) + '</span>' +
                //       '<span id="login_name" style="float: right; font-size: 60%"></span>'
                html: '<table style="width: 100%"><tr><td>' + Ext.String.format('Prototype Vinum (code: {0}, données: 2013-03-15)', last_update) + '</td>' +
                      '<td id="login_name" style="font-size: 60%" align="right"></td></tr></table>'
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
