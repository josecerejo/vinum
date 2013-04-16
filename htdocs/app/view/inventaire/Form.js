Ext.define('VIN.view.inventaire.Form', {

    extend: 'Ext.form.Panel',
    alias: 'widget.inventaire_form',
    title: 'Inventaire',
    closable: true,
    layout: 'border',

    initComponent: function() {

        this.items = [{
            region: 'west',
            layout: 'fit',
            border: false,
            flex: 0.75,
            items: Ext.create('VIN.view.inventaire.Grid', {
                itemId: 'inventaire_g',
                store: Ext.create('VIN.store.Inventaires'),
                column_flex: {
                    type_vin: 3,
                    millesime: 1,
                    format: 1,
                    prix_restaurant: 1.5,
                    prix_particulier: 1.5,
                    prix_coutant: 1.5,
                    solde_caisse: 1,
                    solde_bouteille: 1,
                    no_produit_saq: 1.5,
                    no_demande_saq: 1.5,
                    quantite_commandee: 1.5,
                    quantite_recue: 1.5,
                    date_commande: 2,
                    date_recue: 2,
                    statut_inventaire: 1.5,
                    quantite_par_caisse: 1,
                    age_in_days: 1
                }
            })
        }, {
            region: 'center',
            width: 0,
            flex: 0
        }, {
            region: 'east',
            flex: 0.25,
            xtype: 'panel',
            layout: 'fit',
            collapsible: true,
            items: {
                xtype: 'form',
                itemId: 'inventaire_f',
                frame: true,
                fieldDefaults: {
                    labelAlign: 'top',
                    allowBlank: false
                },
                bodyPadding: 10,
                items: [{
                    xtype: 'combo',
                    anchor: '100%',
                    displayField: 'type_vin',
                    name: 'type_vin',
                    store: Ext.create('VIN.store.Produits'),
                    itemId: 'type_vin_dd',
                    fieldLabel: 'Tous les produits',
                    triggerAction: 'all',
                    minChars: 3,
                    forceSelection: true,
                    pageSize: 10,
                    listConfig: {
                        loadingText: 'Recherche...',
                        emptyText: 'Aucun produit ne correspond à cette recherche..',
                        getInnerTpl: function() {
                            return '<span style="display:inline-block; width:45%; !important">{type_vin}</span>' +
                                '<span style="display:inline-block; width:45%; !important">{nom_domaine}</span>' +
                                '<span style="display:inline-block; width:10%; !important">{format}</span>';
                        }
                    }
                }, {
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    style: 'margin-bottom: 5px',
                    defaults: {
                        flex: 1/2
                    },
                    items: [{
                        xtype: 'numberfield',
                        fieldLabel: 'Millésime',
                        name: 'millesime',
                        allowBlank: true
                    }, {
                        xtype: 'textfield',
                        fieldLabel: 'Format',
                        readOnly: true,
                        cls: 'x-item-disabled', // we need to retrieve it server side for the timbre
                        name: 'format',
                        itemId: 'format_tf',
                        style: 'margin-left: 10px',
                    }]
                }, {
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    style: 'margin-bottom: 5px',
                    defaults: {
                        flex: 1/3
                    },
                    items: [{
                        xtype: 'numberfield',
                        fieldLabel: 'No inventaire',
                        name: 'no_inventaire',
                        itemId: 'no_inventaire_tf',
                        allowBlank: true,
                        readOnly: true,
                        cls: 'x-item-disabled'
                    }, {
                        xtype: 'numberfield',
                        fieldLabel: '# prod. SAQ',
                        name: 'no_produit_saq',
                        style: 'margin-left: 10px',
                        allowBlank: true
                    }, {
                        xtype: 'textfield',
                        fieldLabel: '# dem. SAQ',
                        name: 'no_demande_saq',
                        style: 'margin-left: 10px'
                    }]
                }, {
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    style: 'margin-bottom: 5px',
                    defaults: {
                        flex: 1/3
                    },
                    items: [{
                        xtype: 'pricefield',
                        fieldLabel: '$ coûtant',
                        name: 'prix_coutant'
                    }, {
                        xtype: 'pricefield',
                        fieldLabel: '$ restaurant',
                        name: 'prix_restaurant',
                        itemId: 'prix_restaurant_tf',
                        disabled: true,
                        style: 'margin-left: 10px'
                    }, {
                        xtype: 'pricefield',
                        fieldLabel: '$ particulier',
                        name: 'prix_particulier',
                        itemId: 'prix_particulier_tf',
                        disabled: true,
                        style: 'margin-left: 10px'
                    }]
                }, {
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    style: 'margin-bottom: 5px',
                    defaults: {
                        flex: 1/2
                    },
                    items: [{
                        xtype: 'numberfield',
                        fieldLabel: 'Solde (b)',
                        name: 'solde_bouteille',
                        allowBlank: true
                    }, {
                        xtype: 'numberfield',
                        fieldLabel: 'Solde (c)',
                        name: 'solde_caisse',
                        allowBlank: true,
                        style: 'margin-left: 10px',
                    }]
                }, {
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    style: 'margin-bottom: 5px',
                    defaults: {
                        flex: 1/2
                    },
                    items: [{
                        xtype: 'numberfield',
                        fieldLabel: 'Qté commandée',
                        name: 'quantite_commandee'
                    }, {
                        xtype: 'numberfield',
                        fieldLabel: 'Qté reçue',
                        name: 'quantite_recue',
                        style: 'margin-left: 10px',
                        allowBlank: true
                    }]
                }, {
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    style: 'margin-bottom: 5px',
                    defaults: {
                        flex: 1/2
                    },
                    items: [{
                        xtype: 'datefield',
                        fieldLabel: 'Date de commande',
                        name: 'date_commande'
                    }, {
                        xtype: 'datefield',
                        fieldLabel: 'Date reçue',
                        name: 'date_recue',
                        style: 'margin-left: 10px',
                        allowBlank: true
                    }]
                }, {
                    xtype: 'combo',
                    name: 'statut_inventaire',
                    queryMode: 'local',
                    triggerAction: 'all',
                    displayField: 'statut_inventaire',
                    valueField: 'statut_inventaire',
                    value: 'en attente',
                    fieldLabel: 'Statut',
                    forceSelection: true,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['statut_inventaire'],
                        data: [{statut_inventaire: 'en attente'},
                               {statut_inventaire: 'en réserve'},
                               {statut_inventaire: 'actif'},
                               {statut_inventaire: 'inactif'}]
                    })
                }, {
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    style: 'margin-bottom: 5px; margin-top: 15px',
                    defaults: {
                        flex: 1/2,
                        padding: 5
                    },
                    items: [{
                        xtype: 'button',
                        text: 'Sauvegarder',
                        iconCls: 'disk-icon',
                        itemId: 'save_inv_record_btn'
                    }, {
                        xtype: 'button',
                        text: 'Nouveau',
                        itemId: 'new_inv_record_btn',
                        iconCls: 'app-form-add-icon',
                        style: 'margin-left: 5px'
                    }, {
                        xtype: 'button',
                        text: 'Détruire',
                        itemId: 'del_inv_record_btn',
                        iconCls: 'del-icon',
                        style: 'margin-left: 5px'
                    }]
                }]
            }
        }];

        this.callParent(arguments);
    }

});
