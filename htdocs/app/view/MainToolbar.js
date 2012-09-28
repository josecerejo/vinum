Ext.define('VIN.view.MainToolbar', {
    extend: 'Ext.Toolbar',
    alias: 'widget.main_toolbar',
    items: [{
        text: 'Commandes',
        iconCls: 'commandes-icon',
        menu: [{
            text: 'Créer une commande', 
            iconCls: 'commandes-add-icon'
        }]
    }, {
        text: 'Clients',
        iconCls: 'clients-icon',
        menu: [{
            text: 'Créer un client', 
            disabled: true,
            iconCls: 'clients-add-icon'
        }, {
            text: 'Voir la liste de clients', 
            iconCls: 'clients-list-icon'
        }]
    }]
});
