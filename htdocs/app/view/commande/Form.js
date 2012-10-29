Ext.define('VIN.view.commande.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.commande_form',
    requires: ['VIN.view.produit.List', 'VIN.view.client.ProduitList', 
               'VIN.view.inventaire.List', 'VIN.view.commande.List'],
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
        var client_produit_store = Ext.create('VIN.store.Produits');
        var inventaire_store = Ext.create('VIN.store.Inventaires');
        var commande_store = Ext.create('VIN.store.Commandes', {
            groupField: 'type_vin'
        });

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
                    name: 'nom_social',
                    store: client_search_store,
                    itemId: 'client_combo',
                    fieldLabel: 'Client',
                    minChars: 3,
                    forceSelection: true,
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
                }, {
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [{
                        xtype: 'combo',
                        flex: 0.70,
                        displayField: 'type_vin',
                        name: 'type_vin',
                        store: produit_search_store,
                        itemId: 'produit_combo',
                        fieldLabel: 'Tous les produits',
                        minChars: 3,
                        forceSelection: true,
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
                        style: 'margin-bottom: 20px; margin-right: 20px'
                    }, {
                        xtype: 'numberfield',
                        flex: 0.15,
                        fieldLabel: 'Quantité (c)',
                        itemId: 'add_produit_qc_nf',
                        minValue: 1,
                        //enableKeyEvents: true,
                        style: 'margin-bottom: 20px; margin-right: 20px'
                    }, {
                        xtype: 'button',
                        itemId: 'add_produit_btn',
                        scale: 'small',
                        text: 'Ajouter',
                        iconCls: 'add-icon',
                        style: 'margin-bottom: 20px; margin-top: 20px'
                    }]
                }/*, {
                    xtype: 'datefield',
                    fieldLabel: 'Date',
                    format: 'Y-m-d',
                    value: new Date(),
                    style: 'margin-bottom: 20px'
                }*/, {
                    xtype: 'client_produit_grid',
                    itemId: 'client_produit',
                    title: 'Liste de produits habituels',
                    resizable: { handles: 's' },
                    store: client_produit_store,
                    column_flex: {
                        type_vin: 2,
                        nom_domaine: 2,
                        format: 1,
                        quantite_caisse: 1
                    },
                    height: 300,
                    style: 'margin-bottom: 20px'
                }]
            }, {
                // right part
                layout: 'anchor',
                items: [/*, {
                    xtype: 'button',
                    iconCls: 'add-icon',
                    text: 'Ajouter à la commande',
                    style: 'margin-bottom: 30px'
                }*/, {
                    xtype: 'inventaire_grid',
                    itemId: 'inventaire',
                    title: 'Inventaire pour un produit particulier (choisir dans la liste de gauche ou dans le champ "Tous les produits")',
                    store: inventaire_store,
                    resizable: { handles: 's' },
                    column_flex: {
                        no_produit_saq: 1,
                        no_commande_saq: 1,
                        statut: 1,
                        date_commande: 1,
                        millesime: 1,
                        solde: 1,
                        solde_caisse: 1
                    },
                    height: 300,
                    style: 'margin-bottom: 20px'
                }, {
                    xtype: 'commande_grid',
                    title: 'Produits commandés',
                    itemId: 'commande',
                    store: commande_store,
                    resizable: { handles: 's' },
                    column_flex: {
                        type_vin: 1,
                        format: 1,
                        no_produit_saq: 1,
                        quantite_caisse: 1,
                        quantite_bouteille: 1,
                        commission: 1,
                        statut: 1
                    },
                    height: 300,
                    style: 'margin-bottom: 20px'
                }]                
            }]
        };
        this.callParent(arguments);
    }

});
