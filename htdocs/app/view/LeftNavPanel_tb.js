Ext.define('VIN.view.LeftNavPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.left_nav_panel',
    title: '',
    collapsible: true,
    animCollapse: true,
    layout: 'fit',
    items: {
        xtype: 'toolbar',
        defaults: {
            textAlign: 'left',
            toggleGroup: 'nav_buttons'
        },
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            text: 'Clients',
            iconCls: 'clients-icon',
            pressed: true,
            handler: function() {
                Ext.getCmp('main_pnl').getLayout().setActiveItem(0);
            }
        }, {
            text: 'Commandes',
            iconCls: 'commandes-icon',
            handler: function() {
                Ext.getCmp('main_pnl').getLayout().setActiveItem(1);
            }
        }, {
            text: 'Produits',
            iconCls: 'produits-icon'
        }, {
            text: 'Inventaire',
            iconCls: 'inventaire-icon'
        }]
    }
});
