Ext.define('VIN.view.BackorderWindow', {

    extend: 'Ext.window.Window',

    title: 'Rupture de stock (BO)',
    itemId: 'backorder_w',
    modal: true,
    layout: 'fit',
    closeAction: 'hide',
    closable: true,
    items: {
        xtype: 'form',
        bodyStyle: 'background-color:#dfe8f5',
        border: 0,
        itemId: 'backorder_f',
        padding: 10,
        items: [{
            xtype: 'hidden',
            name: 'backorder_id'
        }, {
            xtype: 'combo',
            width: 300,
            itemId: 'client_dd',
            allowBlank: false,
            displayField: 'nom_social',
            name: 'nom_social',
            store: Ext.create('VIN.store.Clients'),
            fieldLabel: 'Client',
            minChars: 3,
            forceSelection: true,
            pageSize: 10,
            matchFieldWidth: false,
            listConfig: {
                loadingText: 'Recherche...',
                width: 400,
                emptyText: 'Aucun client ne correspond à cette recherche..',
                getInnerTpl: function() {
                    return '<span style="display:inline-block; width:80% !important">{nom_social}</span>' +
                        '<span style="display:inline-block; width:20% !important">{no_client_saq}</span>';
                }
            }
        }, {
            xtype: 'combo',
            width: 300,
            displayField: 'type_vin',
            name: 'type_vin',
            store: Ext.create('VIN.store.Produits'),
            itemId: 'produit_dd',
            allowBlank: false,
            fieldLabel: 'Produit',
            minChars: 3,
            forceSelection: true,
            pageSize: 10,
            matchFieldWidth: false,
            listConfig: {
                loadingText: 'Recherche...',
                width: 400,
                emptyText: 'Aucun produit ne correspond à cette recherche..',
                getInnerTpl: function() {
                    return '<span style="display:inline-block; width:45%; !important">{type_vin}</span>' +
                        '<span style="display:inline-block; width:45%; !important">{nom_domaine}</span>' +
                        '<span style="display:inline-block; width:10%; !important">{format}</span>';
                }
            }
        }, {
            xtype: 'datefield',
            name: 'date_bo',
            fieldLabel: 'Date',
            allowBlank: false,
            width: 200,
            value: new Date() // default today
        }, {
            xtype: 'numberfield',
            name: 'quantite_caisse',
            fieldLabel: 'Quantité (c)',
            allowBlank: false,
            width: 200
        }]
    },
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        layout: {
            pack: 'center'
        },
        items: [{
            text: 'Sauvegarder',
            itemId: 'save_btn',
            iconCls: 'disk-icon'
        }, {
            text: 'Détruire',
            itemId: 'del_btn',
            iconCls: 'del-icon'
        }]
    }]

});
