Ext.define('VIN.view.StartPanel', {

    extend: 'Ext.panel.Panel',
    alias: 'widget.start_panel',
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
                           {name: 'edit_client', src: 'resources/images/icons/about-me.png', text: 'Créer ou modifier un client'},
                           {name: 'list_clients', src: 'resources/images/icons/My-blog.png', text: 'Voir la liste de clients'},
                           {name: 'list_commandes', src: 'resources/images/icons/clipboard_64.png', text: 'Voir la liste de commandes'}]
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
                            VIN.app.getController('Commande').createCommandeForm();
                            break;
                        case 'edit_client':
                            VIN.app.getController('Client').createClientForm();
                            break;
                        case 'list_clients':
                            VIN.app.getController('Client').createClientGrid();                            
                            break;
                        case 'list_commandes':
                            VIN.app.getController('Commande').createCommandeGrid();
                            break;
                        }
                    }
                }
            })
        };

        this.callParent(arguments);
    }

});
