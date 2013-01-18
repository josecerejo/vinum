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
                    itemId: 'produit_dd',
                    fieldLabel: 'Tous les produits',
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
                    items: [{
                        xtype: 'numberfield',
                        fieldLabel: 'Millésime',
                        name: 'millesime',
                        flex: 0.5,
                    }, {
                        flex: 0.5,
                        style: 'margin-left: 10px',
                        xtype: 'combo',
                        fieldLabel: 'Format',
                        displayField: 'format',
                        name: 'format',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['format'],
                            proxy: {
                                type: 'ajax',
                                limitParam: undefined,
                                pageParam: undefined,
                                startParam: undefined,
                                url: ajax_url_prefix + '/produit/get_format',
                                reader: {
                                    type: 'json',
                                    root: 'rows'
                                }
                            }
                        }),
                        minChars: 2,
                        forceSelection: false,
                        listConfig: {
                            loadingText: 'Recherche...',
                            emptyText: 'Aucun format trouvé..'
                        }
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
                        fieldLabel: '$ coûtant',
                        name: 'prix_coutant'
                    }, {
                        xtype: 'numberfield',
                        fieldLabel: '$ restaurant',
                        name: 'prix_restaurant',
                        disabled: true,
                        style: 'margin-left: 10px'
                    }, {
                        xtype: 'numberfield',
                        fieldLabel: '$ particulier',
                        name: 'prix_particulier',
                        disabled: true,
                        style: 'margin-left: 10px'
                    }]
                }]
            }
        }];

        this.callParent(arguments);
    }

});