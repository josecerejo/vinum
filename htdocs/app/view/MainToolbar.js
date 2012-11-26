Ext.define('VIN.view.MainToolbar', {
    extend: 'Ext.Toolbar',
    alias: 'widget.main_toolbar',
    items: [{
        text: 'Commandes',
        iconCls: 'commandes-icon',
        menu: [{
            text: 'Créer une commande', 
            iconCls: 'commandes-add-icon',
            id: 'create_commande_menu_itm'
        }]
    }, {
        text: 'Clients',
        iconCls: 'clients-icon',
        menu: [{
            text: 'Créer ou modifier un client', 
            iconCls: 'clients-add-icon',
            id: 'edit_client_menu_itm'
        }, {
            text: 'Voir la liste de clients', 
            iconCls: 'clients-list-icon',
            id: 'list_clients_menu_itm'
        }]
    }]
});
