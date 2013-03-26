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
                // (*)
                html: '<span style="float: left">' +  Ext.String.format('Prototype Vinum (code: {0}, données: 2013-03-15)', last_update) + '</span>' +
                    '<span id="login_name" style="float: right; font-size: 60%"></span>'
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
        // var dv = Ext.getCmp('main_pnl').down('dataview');
        // console.log(dv);
        // dv.on('viewready', function() {
        //     //console.log(typeof dv.all.elements[0]);
        //     dv.all.elements[1].className += ' x-item-disabled';
        // });
    }

});
