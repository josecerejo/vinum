Ext.define('VIN.view.commande.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.commande_form',
    requires: ['VIN.view.produit.List'],
    frame: true,
    autoScroll: true,
    title: 'Commande',
    closable: true,
    fieldDefaults: {
        labelAlign: 'top'
    },

    initComponent: function() {
        var client_store = Ext.create('VIN.store.Clients');
        var produit_store = Ext.create('VIN.store.Produits');
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
                // left panel
                items: [{
                    xtype: 'combo',
                    displayField: 'nom_social',
                    store: client_store,
                    itemId: 'client_combo',
                    fieldLabel: 'Client',
                    minChars: 3,
                    width: 600,
                    listConfig: {
                        loadingText: 'Recherche...',
                        emptyText: 'Aucun client ne correspond à cette recherche..',
                        getInnerTpl: function() {
                            return '<span style="display:inline-block; width:400px !important">{nom_social}</span>' +
                                '<span style="display:inline-block; width:50px !important">{no_client_saq}</span>';
                        }
                    },
                    pageSize: 10
                }, {
                    xtype: 'datefield',
                    fieldLabel: 'Date',
                    format: 'Y-m-d',
                    value: new Date(),
                    style: 'margin-bottom: 10px'
                }, {
                    xtype: 'produit_grid',
                    title: 'Produits ayant déjà été commandés',
                    column_flex: {
                        type_vin: 2,
                        nom_domaine: 2,
                        format: 1
                    },
                    width: 600,
                    height: 300
                }]
            }, {
                // right panel
                items: [{
                    xtype: 'combo',
                    displayField: 'type_vin',
                    store: produit_store,
                    itemId: 'produit_combo',
                    fieldLabel: 'Produit',
                    minChars: 3,
                    width: 600,
                    listConfig: {
                        loadingText: 'Recherche...',
                        emptyText: 'Aucun produit ne correspond à cette recherche..',            
                        getInnerTpl: function() {
                            return '<span style="display:inline-block; width:250px !important">{type_vin} - </span>' +
                                '<span style="display:inline-block; width:250px !important">{nom_domaine} - </span>' +
                                '<span style="display:inline-block; width:50px !important">{format}</span>';
                        }
                    },
                    pageSize: 10
                }, {
                    xtype: 'button',
                    iconCls: 'add-icon',
                    text: 'Ajouter à la commande',
                    style: 'margin-bottom: 30px'
                }, {
                    xtype: 'produit_grid',
                    bla: 'coucou!',
                    title: 'Produits commandés',
                    column_flex: {
                        type_vin: 1,
                        nom_domaine: 1,
                        format: 1,
                        pays: 1
                    },
                    width: 600,
                    height: 300
                }]                
            }]
        };
        this.callParent(arguments);
    }

});
