Ext.define('VIN.view.MainPanel', {
    extend: 'Ext.TabPanel',
    requires: ['VIN.view.StartPanel'],
    alias: 'widget.main_panel',
    id: 'main_pnl',
    items: [{
        xtype: 'start_panel'
    }, {
        xtype: 'commande_form'
    }]
});
