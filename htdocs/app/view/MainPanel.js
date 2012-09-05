Ext.define('VIN.view.MainPanel', {
    extend: 'Ext.Panel',
    requires: ['VIN.view.client.Panel', 
               'VIN.view.commande.Panel'],
    alias: 'widget.main_panel',
    id: 'main_pnl',
    layout: 'card',
    items: [{
        xtype: 'client_panel'
    }, {
        //xtype: 'commande_panel' 
       html: 'Commandes: à venir..'
    }, {
        html: 'Produits: à venir..'        
    }, {
        html: 'Inventaire: à venir..'
    }]
});
