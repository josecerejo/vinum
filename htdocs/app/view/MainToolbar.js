Ext.define('VIN.view.MainToolbar', {

    extend: 'Ext.Toolbar',
    alias: 'widget.main_toolbar',
    items: [{
        text: 'Vinum',
        iconCls: 'grape-icon',
        menu: [{
            text: 'Déconnexion',
            iconCls: 'disconnect-icon',
            id: 'logout_menu_itm'
        }, {
            text: 'À propos de Vinum',
            iconCls: 'about-icon',
            id: 'vinum_about_menu_itm'
        }]
    }, {
        text: 'Commandes',
        iconCls: 'commandes-icon',
        menu: [{
            text: 'Créer une commande',
            iconCls: 'commandes-add-icon',
            id: 'create_commande_menu_itm'
        }, {
            text: 'Toutes les commandes',
            iconCls: 'clients-list-icon',
            id: 'list_commandes_menu_itm'
        }]
    }, {
        text: 'Clients',
        iconCls: 'clients-icon',
        menu: [{
            text: 'Créer ou modifier un client',
            iconCls: 'clients-add-icon',
            id: 'edit_client_menu_itm'
        }, {
            text: 'Tous les clients',
            iconCls: 'clients-list-icon',
            id: 'list_clients_menu_itm'
        }]
    }, {
        text: 'Produits',
        iconCls: 'produits-icon',
        menu: [{
            text: 'Produits et producteurs',
            iconCls: 'produits-icon',
            id: 'produits_pp_menu_itm'
        }, {
            text: 'Inventaire',
            iconCls: 'clients-list-icon',
            id: 'produits_inv_menu_itm'
        }]
    }, {
        text: 'Ruptures de stock (BOs)',
        iconCls: 'error-icon',
        menu: [{
            text: 'Voir la liste',
            iconCls: 'clients-list-icon',
            id: 'bo_list_menu_itm'
        }, {
            text: 'Créer un BO',
            iconCls: 'add-icon',
            id: 'bo_create_menu_itm'
        }]
    }, {
        text: 'Rapports',
        iconCls: 'report-icon',
        menu: [{
            text: 'Rapport des transactions',
            iconCls: 'report-icon',
            id: 'rapport_transaction_menu_itm'
        }, {
            text: 'Rapport des ventes',
            iconCls: 'report-icon',
            id: 'rapport_vente_menu_itm'
        }]
    }]

});
