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
            items: {
                //width: 400,
                items: Ext.create('Ext.view.View', {
                    store: Ext.create('Ext.data.Store', {
                        fields: ['name', 'src', 'text'],
                        data: [{name: 'create_commande', src: 'resources/images/icons/empty-shopping-cart.png', text: 'Créer une commande'},
                               {name: 'edit_client', src: 'resources/images/icons/about-me.png', text: 'Créer ou modifier un client'},
                               {name: 'list_clients', src: 'resources/images/icons/My-blog.png', text: 'Voir les clients'},
                               {name: 'list_commandes', src: 'resources/images/icons/clipboard_64.png', text: 'Voir les commandes'},
                               {name: 'list_pp', src: 'resources/images/icons/wine_glass_64.png', text: 'Voir les produits et producteurs'},
                               {name: 'inventaire', src: 'resources/images/icons/inventaire_boite_64.png', text: 'Voir l\'inventaire'}]
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
                    //overItemCls: 'x-item-over',
                    itemSelector: 'div.thumb-wrap',
                    listeners: {
                        itemclick: function(dv, rec, item, idx, e, opts) {
                            if (jQuery(item).hasClass('x-item-disabled')) { return; }
                            switch (rec.get('name')) {
                            case 'create_commande':
                                VIN.app.getController('Commande').createFormTab();
                                break;
                            case 'edit_client':
                                VIN.app.getController('Client').createFormTab();
                                break;
                            case 'list_clients':
                                VIN.app.getController('Client').createGridTab();
                                break;
                            case 'list_commandes':
                                VIN.app.getController('Commande').createGridTab();
                                break;
                            case 'list_pp':
                                VIN.app.getController('ProduitEtProducteur').createTab();
                                break;
                            case 'inventaire':
                                VIN.app.getController('Inventaire').createTab();
                                break;
                            }
                        },

                        itemmouseenter: function(dv, rec, item, idx, e, opts) {
                            if (!jQuery(item).hasClass('x-item-disabled')) {
                                jQuery(item).addClass('x-item-over');
                            }
                        },

                        itemmouseleave: function(dv, rec, item, idx, e, opts) {
                            jQuery(item).removeClass('x-item-over');
                        }

                    }
                })
            }
        };
        this.callParent(arguments);

    }

});
