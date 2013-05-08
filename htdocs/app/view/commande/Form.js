Ext.define('VIN.view.commande.Form', {

    extend: 'Ext.form.Panel',
    alias: 'widget.commande_form',
    requires: ['VIN.view.client.ProduitGrid',
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
                itemId: 'email_f',
                padding: 10,
                fieldDefaults: {
                    anchor: '100%'
                },
                layout: {
                    type: 'vbox',
                    align: 'stretch'  // Child items are stretched to full width
                },
                items: [{
                    xtype: 'combo',
                    queryMode: 'local',
                    triggerAction: 'all',
                    displayField: 'addr',
                    name: 'email_addresses',
                    fieldLabel: 'Adresse(s)',
                    forceSelection: false,
                    itemId: 'email_addr_dd',
                    allowBlank: false,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['addr']
                    })
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
            items: [{
                xtype: 'button',
                text: 'Sauvegarder',
                itemId: 'save_commande_btn',
                iconCls: 'disk-icon'
            }, {
                xtype: 'tbspacer',
                width: 5
            }, {
                xtype: 'buttongroup',
                title: 'Bon de commande',
                items: [{
                    text: 'Visualiser',
                    itemId: 'preview_bdc_btn',
                    iconCls: 'monitor-icon'
                }, {
                    xtype: 'tbspacer',
                    width: 5
                }, {
                    text: 'Envoyer par courriel',
                    itemId: 'email_bon_de_commande_btn',
                    iconCls: 'email-icon'
                }]
            }, {
                xtype: 'tbspacer',
                width: 5
            }, {
                xtype: 'buttongroup',
                title: 'Facture',
                items: [{
                    text: 'Visualiser',
                    itemId: 'preview_facture_btn',
                    iconCls: 'monitor-icon'
                }, {
                    xtype: 'tbspacer',
                    width: 5
                }, {
                    text: 'Envoyer par courriel',
                    itemId: 'email_facture_btn',
                    iconCls: 'email-icon'
                }, {
                    xtype: 'tbspacer',
                    width: 5
                }, {
                    text: 'Imprimer',
                    iconCls: 'printer-icon',
                    menu: [{
                        text: 'Avec logo',
                        itemId: 'facture_print_logo_btn',
                        iconCls: 'bullet-add-icon'
                    }, {
                        text: 'Sans logo',
                        itemId: 'facture_print_no_logo_btn',
                        iconCls: 'bullet-delete-icon'
                    }]
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
                    xtype: 'hidden',
                    name: 'facture_est_envoyee',
                    itemId: 'facture_est_envoyee_hidden'
                }, {
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
                            name: 'type_client',
                            flex: 0.2,
                            readOnly: true,
                            cls: 'x-item-disabled'
                        }],
                    }, {
                        layout: 'hbox',
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false,
                        defaults: {
                            padding: 5
                        },
                        items: [{
                            flex: 0.8,
                            xtype: 'textfield',
                            fieldLabel: 'Notes (client)',
                            name: 'note_client',
                            disabled: true
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Facturation',
                            name: 'mode_facturation',
                            flex: 0.2,
                            readOnly: true,
                            cls: 'x-item-disabled'
                        }]
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
                            displayField: 'no_succursale_saq',
                            name: 'no_succursale_saq',
                            queryCaching: false, // important in case the succs are updated elsewhere
                            store: Ext.create('VIN.store.Succursales'),
                            hideLabel: true,
                            minChars: 3,
                            forceSelection: false, // to allow setting record field no_succursale_saq alone
                            matchFieldWidth: false,
                            listConfig: {
                                loadingText: 'Recherche...',
                                emptyText: 'Aucune succursale ne correspond à cette recherche..',
                                getInnerTpl: function() {
                                    return '<span style="display:inline-block; width:20% !important">{no_succursale_saq}</span>' +
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
                    title: 'Liste de produits habituels pour le client',
                    resizable: { handles: 's' },
                    store: Ext.create('VIN.store.Produits'),
                    load_after_render: false,
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
                //layout: 'anchor',
                items: [{
                    border: false,
                    bodyStyle: 'background-color:#dfe8f5',
                    defaults: {
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false,
                        padding: 5,
                        flex: 1/5
                    },
                    layout: 'hbox',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: 'No comm. Roucet',
                        readOnly: true,
                        cls: 'x-item-disabled',
                        name: 'no_commande_facture',
                        itemId: 'no_commande_facture_tf'
                    }, {
                        xtype: 'textfield',
                        fieldLabel: 'No comm. SAQ',
                        name: 'no_commande_saq',
                        itemId: 'no_commande_saq_tf'
                    }, {
                        xtype: 'datefield',
                        fieldLabel: 'Date de comm.',
                        name: 'date_commande',
                        format: 'Y-m-d',
                        value: new Date()
                    }, {
                        xtype: 'datefield',
                        fieldLabel: 'Date envoi SAQ',
                        name: 'date_envoi_saq',
                        format: 'Y-m-d',
                        value: new Date()
                    }, {
                        xtype: 'combo',
                        itemId: 'default_commission_dd',
                        queryMode: 'local',
                        triggerAction: 'all',
                        displayField: 'default_commission',
                        name: 'default_commission',
                        fieldLabel: 'Commission',
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
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    defaults: { padding: 5 },
                    items: {
                        xtype: 'textfield',
                        flex: 1,
                        fieldLabel: 'Notes',
                        name: 'note_commande',
                        //height: 60,
                        //resizable: { handles: 's' }
                    },
                    style: 'margin-bottom: 10px'
                }, {
                    xtype: 'vin_grid',
                    title: 'Inventaire pour un produit particulier',
                    itemId: 'inventaire_produit_g',
                    store: Ext.create('VIN.store.Inventaires', {
                        sorters: [{
                            property: 'date_commande',
                            direction: 'ASC'
                        }]
                    }),
                    collapsible: false,
                    closable: false,
                    selModel: {
                        mode: 'MULTI'
                    },
                    resizable: { handles: 's' },
                    load_after_render: false,
                    column_flex: {
                        no_produit_saq: 1,
                        no_demande_saq: 1,
                        statut_inventaire: 1,
                        date_commande: 1,
                        millesime: 1,
                        solde_bouteille: 1,
                        solde_caisse: 1
                    },
                    height: grid_height - 110,
                    style: 'margin-bottom: 14px'
                }, {
                    xtype: 'commande_item_grid',
                    itemId: 'commande_item_g',
                    title: 'Produits commandés',
                    load_after_render: false,
                    store: Ext.create('VIN.store.CommandeItems'),
                    resizable: { handles: 's' },
                    is_editable: true,
                    add_delete_actioncolumn: true,
                    column_flex: {
                        type_vin: 1,
                        format: 1,
                        no_produit_saq: 1,
                        quantite_caisse: 0.5,
                        quantite_bouteille: 0.5,
                        commission: 0.75,
                        montant_commission: 0.75,
                        statut_item: 0.5
                    },
                    height: grid_height
                }]
            }]
        };
        this.callParent(arguments);
    }

});
