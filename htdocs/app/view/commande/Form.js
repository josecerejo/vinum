Ext.define('VIN.view.commande.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.commande_form',
    requires: ['VIN.view.produit.List', 'VIN.view.inventaire.List'],
    frame: true,
    autoScroll: true,
    title: 'Commande',
    closable: true,
    fieldDefaults: {
        labelAlign: 'top'
    },

    initComponent: function() {
        var client_search_store = Ext.create('VIN.store.Clients');
        var produit_search_store = Ext.create('VIN.store.Produits');
        var produits_commandes_store = Ext.create('VIN.store.Produits');
        var inventaire_store = Ext.create('VIN.store.Inventaires');
        this.items = {
            bodyStyle: 'background-color:#dfe8f5',
            border: false,
            defaults: {
                bodyStyle: 'background-color:#dfe8f5',
                border: false,
                padding: 10,
                flex: .5
            },
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                // left part
                layout: 'anchor',
                items: [{
                    xtype: 'combo',
                    anchor: '100%',
                    displayField: 'nom_social',                    
                    store: client_search_store,
                    itemId: 'client_combo',
                    fieldLabel: 'Client',
                    minChars: 3,
                    listConfig: {
                        loadingText: 'Recherche...',
                        emptyText: 'Aucun client ne correspond à cette recherche..',
                        getInnerTpl: function() {
                            return '<span style="display:inline-block; width:80% !important">{nom_social}</span>' +
                                   '<span style="display:inline-block; width:20% !important">{no_client_saq}</span>';
                        }
                    },
                    pageSize: 10,
                    style: 'margin-bottom: 20px'
                }/*, {
                    xtype: 'datefield',
                    fieldLabel: 'Date',
                    format: 'Y-m-d',
                    value: new Date(),
                    style: 'margin-bottom: 20px'
                }*/, {
                    xtype: 'produit_grid',
                    itemId: 'produits_commandes',
                    title: 'Produits ayant déjà été commandés par ce client',
                    resizable: { handles: 's' },
                    store: produits_commandes_store,
                    column_flex: {
                        type_vin: 2,
                        nom_domaine: 2,
                        format: 1
                    },
                    height: 300,
                    style: 'margin-bottom: 20px'
                }, {

                    xtype: 'produit_grid',
                    title: 'Produits commandés',
                    resizable: { handles: 's' },
                    column_flex: {
                        type_vin: 2,
                        nom_domaine: 2,
                        format: 1
                    },
                    height: 300
                    
                }]
            }, {
                // right part
                layout: 'anchor',
                items: [{
                    xtype: 'combo',
                    anchor: '100%',
                    displayField: 'type_vin',
                    store: produit_search_store,
                    itemId: 'produit_combo',
                    fieldLabel: 'Produit',
                    minChars: 3,
                    listConfig: {
                        loadingText: 'Recherche...',
                        emptyText: 'Aucun produit ne correspond à cette recherche..',            
                        getInnerTpl: function() {
                            return '<span style="display:inline-block; width:45%; !important">{type_vin}</span>' +
                                   '<span style="display:inline-block; width:45%; !important">{nom_domaine}</span>' +
                                   '<span style="display:inline-block; width:10%; !important">{format}</span>';
                        }
                    },
                    pageSize: 10,
                    style: 'margin-bottom: 20px'
                }/*, {
                    xtype: 'button',
                    iconCls: 'add-icon',
                    text: 'Ajouter à la commande',
                    style: 'margin-bottom: 30px'
                }*/, {
                    xtype: 'inventaire_grid',
                    title: 'Inventaire pour un produit particulier',
                    store: inventaire_store,
                    resizable: { handles: 's' },
                    column_flex: {
                        no_produit_saq: 1,
                        no_commande_saq: 1,
                        statut: 1,
                        date_commande: 1,
                        quantite_commandee: 1,
                        quantite_recue: 1
                    },
                    height: 300
                }]                
            }]
        };
        this.callParent(arguments);
    }

});