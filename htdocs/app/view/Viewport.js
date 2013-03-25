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
                html: '<div style="float: left; widh: 100%; overflow: hidden">' +  Ext.String.format('Prototype Vinum (code: {0}, données: 2013-03-15)', last_update) + '</div>' +
                    '<div style="float: right">bla</div>'
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
