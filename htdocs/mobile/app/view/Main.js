Ext.define('VinumMobile.view.Main', {
    extend: 'Ext.navigation.View',
    xtype: 'mainview',
    id: 'mainview',
    config: {
        fullscreen: true,
        items: {
            title: 'Vinum Mobile',
            layout: 'fit',
            items: {
                xtype: 'list',
                disableSelection: true,
                onItemDisclosure: true,
                itemTpl: '{title}',
                itemId: 'top_nav_list',
                data: [
                    { title: 'Clients' },
                    { title: 'Commandes' },
                    { title: 'Produits' },
                    { title: 'Inventaire' }
                ]
            }
        }
    }

});
