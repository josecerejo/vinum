Ext.define('VIN.view.StartPanel', {

    extend: 'Ext.panel.Panel',
    alias: 'widget.start_panel',
    views: ['VIN.view.MainPanel', 'VIN.view.client.List', 'VIN.view.commande.Form', 'VIN.view.client.FOrm'],
    layout: 'fit',
    title: 'Démarrer',
    iconCls: 'home-icon',

    initComponent: function() {

        this.items = {
            id: 'images-view',
            bodyStyle: 'background-color: #dfe8f5',
            border: false,
            defaults: {
                bodyStyle: 'background-color: #dfe8f5',
                border: false,
                padding: 10,
                flex: .5
            },       
            items: Ext.create('Ext.view.View', {
                store: Ext.create('Ext.data.Store', {
                    fields: ['name', 'src', 'text'],
                    data: [{name: 'create_commande', src: 'resources/images/icons/empty-shopping-cart.png', text: 'Créer une commande'},
                           {name: 'edit_client', src: 'resources/images/icons/about-me.png', text: 'Créer ou modifier un client'}]
                }),     
                tpl: [
                    '<tpl for=".">',
                    '<div class="thumb-wrap" id="{id}">',
                    '<div class="thumb"><img src="{src}" title="{text}" /></div>',
                    '<span>{text}</span></div>',
                    '</tpl>',
                    '<div class="x-clear"></div>'
                ],
                trackOver: true,
                overItemCls: 'x-item-over',
                itemSelector: 'div.thumb-wrap',
                listeners: {
                    itemclick: function(dvm, rec) {
                        switch (rec.get('name')) {
                        case 'create_commande':
                            var cf = Ext.create('widget.commande_form');
                            Ext.getCmp('main_pnl').add(cf);
                            Ext.getCmp('main_pnl').setActiveTab(cf);
                            break;
                        case 'edit_client':
                            var cf = Ext.create('widget.client_form');
                            Ext.getCmp('main_pnl').add(cf);
                            Ext.getCmp('main_pnl').setActiveTab(cf);
                            break;
                        }
                    }
                }
            })
        };

        this.callParent(arguments);
    }

});
