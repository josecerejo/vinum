Ext.define('VIN.view.commande.Form', {

    extend: 'Ext.form.Panel',
    alias: 'widget.commande_form',
    requires: ['VIN.view.produit.Grid', 'VIN.view.client.ProduitGrid',
               'VIN.view.inventaire.Grid', 'VIN.view.commande.ItemGrid'],
    frame: true,
    autoScroll: true,
    title: 'Commande',
    closable: true,
    fieldDefaults: {
        labelAlign: 'top'
    },

    initComponent: function() {

        var grid_height = 326;

        this.email_msg_facture = 'Bonjour,\n\nVoici votre facture.\n\nBonne journée,\n\nLa Société Roucet';
        this.email_msg_bdc = 'Bonjour,\n\nVoici le bon de commande.\n\nBonne journée,\n\nLa Société Roucet';

        // email form
        this.email_win = Ext.create('Ext.window.Window', {
            title: 'Envoyer un document par courriel',
            width: 600,
            height: 500,
            layout: 'fit',
            closeAction: 'hide',
            parent_form: this,
            itemId: 'email_win',
            items: {
                xtype: 'form',
                bodyStyle: 'background-color:#dfe8f5',
                border: 0,
                itemId: 'email_form',
                padding: 10,
                fieldDefaults: {
                    anchor: '100%'
                },
                layout: {
                    type: 'vbox',
                    align: 'stretch'  // Child items are stretched to full width
                },
                items: [{
                    xtype: 'textfield',
                    fieldLabel: 'Adresse(s)',
                    name: 'email_addresses',
                    itemId: 'email_addr_tf',
                    allowBlank: false
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Sujet',
                    name: 'subject',
                    itemId: 'email_subject_tf',
                    value: 'Facture',
                    allowBlank: false
                }, {
                    xtype: 'checkbox',
                    boxLabel: 'Inclure le document en fichier PDF',
                    name: 'include_pdf',
                    checked: true
                }, {
                    xtype: 'textarea',
                    hideLabel: true,
                    name: 'msg',
                    itemId: 'email_msg_ta',
                    allowBlank: false,
                    style: 'margin: 0', // Remove default margin
                    flex: 1  // Take up all *remaining* vertical space
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
                    text: 'Envoyer',
                    itemId: 'send_email_btn'
                },{
                    text: 'Annuler',
                    itemId: 'cancel_email_btn'
                }]
            }]
        });

        this.dockedItems = {
            xtype: 'toolbar',
            dock: 'top',
            items: [/*{
                xtype: 'button',
                text: 'Sauvegarder la commande',
                iconCls: 'disk-icon',
                itemId: 'save_commande_btn'
            },*/ {
                xtype: 'buttongroup',
                title: 'Facture',
                items: [{
                    text: 'Visualiser',
                    itemId: 'preview_facture_btn',
                    iconCls: 'monitor-icon'
                }, {
                    text: 'Envoyer par courriel',
                    itemId: 'email_facture_btn',
                    iconCls: 'email-attach-icon'
                }]
            }, {
                xtype: 'buttongroup',
                title: 'Bon de commande',
                items: [{
                    text: 'Visualiser',
                    itemId: 'preview_bdc_btn',
                    iconCls: 'monitor-icon'
                }, {
                    text: 'Envoyer par courriel',
                    itemId: 'email_bon_de_commande_btn',
                    iconCls: 'email-attach-icon'
                }]
            }]
        };

        this.items = {
            bodyStyle: 'background-color:#dfe8f5',
            border: false,
            defaults: {
                bodyStyle: 'background-color:#dfe8f5',
                padding: 10,
                flex: .5,
                border: false
            },
            layout: 'hbox',
            items: [{
                items: [{
                    // -----------------------------------------------------
                    // left part panel
                    xtype: 'fieldset',
                    title: 'Client',
                    defaults: {
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false
                    },
                    items: [{
                        layout: 'hbox',
                        defaults: {
                            padding: 5,
                        },
                        items: [{
                            xtype: 'combo',
                            itemId: 'client_dd',
                            allowBlank: false,
                            flex: 0.8,
                            displayField: 'nom_social',
                            name: 'nom_social',
                            store: Ext.create('VIN.store.Clients'),
                            fieldLabel: 'Nom',
                            minChars: 3,
                            forceSelection: true,
                            pageSize: 10,
                            listConfig: {
                                loadingText: 'Recherche...',
                                emptyText: 'Aucun client ne correspond à cette recherche..',
                                getInnerTpl: function() {
                                    return '<span style="display:inline-block; width:80% !important">{nom_social}</span>' +
                                           '<span style="display:inline-block; width:20% !important">{no_client_saq}</span>';
                                }
                            }
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Type',
                            itemId: 'type_client_tf',
                            name: 'type_client',
                            flex: 0.2,
                            readOnly: true,
                            cls: 'x-item-disabled'
                        }],
                    }, {
                        layout: 'hbox',
                        defaults: {
                            padding: 5
                        },
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: 'Adresse',
                            itemId: 'adresse_tf',
                            flex: 0.5,
                            disabled: true
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Jours de livraison',
                            name: 'jours_livraison',
                            flex: 0.3,
                            disabled: true
                        }, {
                            xtype: 'button',
                            flex: 0.2,
                            padding: 2,
                            itemId: 'details_client_btn',
                            text: 'Détails du client',
                            disabled: true,
                            iconCls: 'client-icon',
                            style: 'margin-top: 25px'
                        }]
                    }]
                }, {
                    xtype: 'fieldset',
                    title: 'Expédition',
                    defaults: {
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false
                    },
                    items: [{
                        layout: 'hbox',
                        defaults: {
                            bodyStyle: 'background-color:#dfe8f5',
                            border: false,
                            padding: 5
                        },
                        items: [{
                            xtype: 'radiofield',
                            boxLabel: 'Direct',
                            name: 'expedition',
                            inputValue: 'direct',
                            itemId: 'direct_rb',
                            checked: true,
                            flex: 0.05
                        }, {
                            xtype: 'datefield',
                            hideLabel: true,
                            name: 'date_direct',
                            format: 'Y-m-d',
                            flex: 0.1,
                            itemId: 'direct_df'
                        }, {
                            xtype: 'radiofield',
                            boxLabel: 'Succ.',
                            name: 'expedition',
                            inputValue: 'succursale',
                            flex: 0.05,
                            itemId: 'succ_rb'
                        }, {
                            xtype: 'combo',
                            itemId: 'succ_dd',
                            flex: 0.1,
                            displayField: 'no_succursale',
                            name: 'no_succursale',
                            store: Ext.create('Ext.data.Store', {
                                model: Ext.define('VIN.model.Succursale', {
                                    extend: 'Ext.data.Model',
                                    fields: ['no_succursale', 'ville', 'adresse']
                                }),
                                proxy: {
                                    type: 'ajax',
                                    limitParam: undefined,
                                    pageParam: undefined,
                                    startParam: undefined,
                                    url: ajax_url_prefix + '/misc/get_succursales',
                                    reader: {
                                        type: 'json',
                                        root: 'rows'
                                    }
                                }
                            }),
                            hideLabel: true,
                            minChars: 3,
                            forceSelection: false, // to allow setting record field no_succursale alone
                            matchFieldWidth: false,
                            listConfig: {
                                loadingText: 'Recherche...',
                                emptyText: 'Aucune succursale ne correspond à cette recherche..',
                                getInnerTpl: function() {
                                    return '<span style="display:inline-block; width:20% !important">{no_succursale}</span>' +
                                        '<span style="display:inline-block; width:35% !important">{ville}</span>' +
                                        '<span style="display:inline-block; width:45% !important">{adresse}</span>';
                                }
                            }
                        }, {
                            xtype: 'radiofield',
                            boxLabel: 'Pick up',
                            name: 'expedition',
                            inputValue: 'pickup',
                            flex: 0.05,
                            itemId: 'pickup_rb'
                        }, {
                            xtype: 'datefield',
                            hideLabel: true,
                            name: 'date_pickup',
                            format: 'Y-m-d',
                            flex: 0.1,
                            itemId: 'pickup_df'
                        }]
                    }]
                }, {
                    border: false,
                    bodyStyle: 'background-color:#dfe8f5',
                    defaults: {
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false,
                        padding: 5
                    },
                    layout: 'hbox',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: 'No commande Roucet',
                        flex: 0.25,
                        readOnly: true,
                        cls: 'x-item-disabled',
                        name: 'no_commande_facture',
                        itemId: 'no_commande_facture_tf'
                    }, {
                        xtype: 'textfield',
                        flex: 0.25,
                        fieldLabel: 'No commande SAQ',
                        name: 'no_commande_saq',
                        itemId: 'no_commande_saq_tf'
                    }, {
                        xtype: 'datefield',
                        fieldLabel: 'Date',
                        name: 'date_commande',
                        format: 'Y-m-d',
                        value: new Date(),
                        flex: 0.25
                        //style: 'margin-right: 20px'
                    }, {
                        xtype: 'combo',
                        itemId: 'default_commission_dd',
                        flex: 0.25,
                        queryMode: 'local',
                        triggerAction: 'all',
                        displayField: 'default_commission',
                        name: 'default_commission',
                        fieldLabel: 'Commission par défaut',
                        forceSelection: false,
                        regex: /^0\.?[0-9]*$/,
                        regexText: 'La commission doit être une valeur entre 0 et 1',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['default_commission'],
                            // !!! this should ideally come from the backend, not be hardcoded here
                            data: [{default_commission: 0.16},
                                   {default_commission: 0.23}]
                        })
                    }]
                }, {
                    border: false,
                    bodyStyle: 'background-color:#dfe8f5',
                    layout: 'hbox',
                    style: 'margin-bottom: 10px',
                    defaults: {
                        padding: 5
                    },
                    items: [{
                        xtype: 'combo',
                        flex: 0.70,
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
                        xtype: 'numberfield',
                        flex: 0.15,
                        fieldLabel: 'Quantité (c)',
                        itemId: 'add_produit_qc_nf',
                        minValue: 1
                    }, {
                        xtype: 'button',
                        padding: 2,
                        itemId: 'add_produit_btn',
                        text: 'Ajouter',
                        iconCls: 'add-icon',
                        style: 'margin-top: 25px'
                    }]
                }, {
                    xtype: 'client_produit_grid',
                    itemId: 'client_produit_g',
                    title: 'Liste de produits habituels de ce client',
                    resizable: { handles: 's' },
                    store: Ext.create('VIN.store.Produits'),
                    column_flex: {
                        type_vin: 2,
                        nom_domaine: 2,
                        format: 1,
                        quantite_caisse: 1
                    },
                    height: grid_height
                }]
            }, {
                // -----------------------------------------------------
                // right part panel
                items: [{
                    xtype: 'inventaire_grid',
                    is_master_grid: false,
                    itemId: 'inventaire_g',
                    collapsible: false,
                    closable: false,
                    use_paging_toolbar: false,
                    title: 'Inventaire pour un produit particulier (choisir dans la liste de gauche ou dans le champ "Tous les produits")',
                    store: Ext.create('VIN.store.Inventaires'),
                    resizable: { handles: 's' },
                    column_flex: {
                        no_produit_saq: 1,
                        no_commande_saq: 1,
                        statut: 1,
                        date_commande: 1,
                        millesime: 1,
                        solde_bouteille: 1,
                        solde_caisse: 1
                    },
                    height: grid_height,
                    style: 'margin-bottom: 20px'
                }, {
                    xtype: 'commande_item_grid',
                    itemId: 'commande_item_g',
                    title: 'Produits commandés',
                    store: Ext.create('VIN.store.CommandeItems'),
                    resizable: { handles: 's' },
                    is_editable: true,
                    column_flex: {
                        type_vin: 1,
                        format: 1,
                        no_produit_saq: 1,
                        quantite_caisse: 0.5,
                        quantite_bouteille: 0.5,
                        commission: 0.75,
                        montant_commission: 0.75,
                        statut: 0.5
                    },
                    height: grid_height
                }]
            }]
        };
        this.callParent(arguments);
    }

});
