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
                html: '<table style="width: 100%; table-layout: fixed"><tr>' +
                      Ext.String.format('<td style="padding: 10px">Vinum ({0}@{1})</td>', vinum_version, server_name) +
                      '<td id="dev_msg" style="font-size: 50%; border: 1px dashed; padding-left: 5px"></td>' +
                      '<td id="login_name" style="font-size: 60%" align="right"></td>' +
                      '</tr></table>'
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
