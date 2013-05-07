Ext.define('VIN.view.client.Form', {

    extend: 'Ext.form.Panel',
    alias: 'widget.client_form',
    requires: ['VIN.view.Grid', 'VIN.view.commande.ItemGrid'],
    autoScroll: true,
    title: 'Client',
    closable: true,
    frame: true,
    url: ajax_url_prefix + '/client/get',
    fieldDefaults: {
        labelAlign: 'top'
    },

    initComponent: function() {

        var grid_height = 326;

        this.dockedItems = {
            xtype: 'toolbar',
            dock: 'top',
            items: [{
                text: 'Sauvegarder',
                itemId: 'save_btn',
                iconCls: 'disk-icon'
            }, {
                text: 'Créer une commande pour ce client',
                itemId: 'create_commande_btn',
                iconCls: 'commandes-add-icon'
            }]
        };

        // an object is created just to be able to set a callback
        // on afterrender to disable the grouping feature
        var ci_grid = Ext.create('VIN.view.commande.ItemGrid', {
            //style: 'margin-top: 49px', // align with grid on left
            itemId: 'commande_item_g',
            title: 'Produits commandés',
            store: Ext.create('VIN.store.CommandeItems'),
            load_after_render: false,
            resizable: { handles: 's' },
            is_editable: false,
            column_flex: {
                type_vin: 1.5,
                format: 1,
                nom_producteur: 1.5,
                no_produit_saq: 1,
                quantite_caisse: 0.5,
                quantite_bouteille: 0.5,
                commission: 0.75,
                montant_commission: 0.75,
                statut_item: 0.5
            },
            height: grid_height + 72
        });
        ci_grid.on('afterrender', function(grid) {
            grid.features[0].disable();
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
            layout: 'hbox',
            items: [{
                // -----------------------------------------------------
                // left part panel
                layout: 'anchor',
                items: [{
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    defaults: {
                        padding: 5
                    },
                    items: [{
                        xtype: 'combo',
                        allowBlank: false,
                        flex: 0.7,
                        displayField: 'nom_social',
                        name: 'nom_social',
                        store: Ext.create('VIN.store.Clients'),
                        itemId: 'nom_social_dd',
                        fieldLabel: 'Client',
                        minChars: 3,
                        forceSelection: false, // important if we want to allow client creation
                        pageSize: 10,
                        style: 'margin-bottom: 10px;',
                        listConfig: {
                            loadingText: 'Recherche...',
                            emptyText: 'Aucun client ne correspond à cette recherche..',
                            getInnerTpl: function() {
                                return '<span style="display:inline-block; width:80% !important">{nom_social}</span>' +
                                    '<span style="display:inline-block; width:20% !important">{no_client_saq}</span>';
                            }
                        }
                    }, {
                        xtype: 'combo',
                        allowBlank: false,
                        name: 'type_client',
                        queryMode: 'local',
                        triggerAction: 'all',
                        displayField: 'type_client',
                        valueField: 'type_client',
                        fieldLabel: 'Type de client',
                        forceSelection: true,
                        flex: 0.2,
                        store: Ext.create('Ext.data.Store', {
                            fields: ['type_client'],
                            data: [{type_client: 'restaurant'},
                                   {type_client: 'particulier'}]
                        })
                    }, {
                        flex: 0.2,
                        xtype: 'datefield',
                        allowBlank: true,
                        fieldLabel: "Création",
                        name: 'date_ouverture_dossier',
                        value: new Date()
                    }],
                }, {
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    style: 'margin-bottom: 10px',
                    defaults: {
                        padding: 5
                    },
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: 'No client SAQ',
                        name: 'no_client_saq',
                        flex: 0.3
                    }, {
                        xtype: 'textfield',
                        fieldLabel: 'No client Roucet',
                        readOnly: true,
                        cls: 'x-item-disabled',
                        name: 'no_client',
                        itemId: 'no_client_tf',
                        flex: 0.3
                    }, {
                        xtype: 'combo',
                        flex: 0.4,
                        fieldLabel: 'Représentant',
                        allowBlank: false,
                        displayField: 'representant_nom',
                        name: 'representant_nom',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['representant_nom'],
                            proxy: {
                                type: 'ajax',
                                limitParam: undefined,
                                pageParam: undefined,
                                startParam: undefined,
                                url: ajax_url_prefix + '/representant/get_representants',
                                reader: {
                                    type: 'json',
                                    root: 'rows'
                                }
                            }
                        }),
                        minChars: 3,
                        forceSelection: false,
                        listConfig: {
                            loadingText: 'Recherche...',
                            emptyText: 'Aucun représentant ne correspond à cette recherche..'
                        }
                    }]
                }, {
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    items: [{
                        xtype: 'fieldset',
                        title: 'Adresse de livraison',
                        flex: 0.5,
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
                                xtype: 'textfield',
                                fieldLabel: 'No',
                                name: 'no_civique',
                                itemId: 'no_civique_tf',
                                flex: 0.1
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Rue',
                                name: 'rue',
                                itemId: 'rue_tf',
                                flex: 0.4
                            }]
                        }, {
                            layout: 'hbox',
                            defaults: {
                                padding: 5,
                            },
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: 'Ville',
                                name: 'ville',
                                itemId: 'ville_tf',
                                flex: 1/6
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Province',
                                name: 'province',
                                itemId: 'province_tf',
                                flex: 1/6
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Code postal',
                                regex: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
                                regexText: 'Le format doit être: H0H 0H0',
                                name: 'code_postal',
                                itemId: 'code_postal_tf',
                                flex: 1/6
                            }]
                        }]
                    }, {
                        xtype: 'button',
                        scale: 'small',
                        itemId: 'copy_addr_btn',
                        iconCls: 'arrow-right-icon',
                        style: 'margin-right: 5px; margin-left: 5px; margin-top: 60px'
                    }, {
                        xtype: 'fieldset',
                        title: 'Adresse de facturation',
                        flex: 0.5,
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
                                xtype: 'textfield',
                                fieldLabel: 'No',
                                name: 'no_civique_fact',
                                itemId: 'no_civique_fact_tf',
                                flex: 0.1
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Rue',
                                name: 'rue_fact',
                                itemId: 'rue_fact_tf',
                                flex: 0.4
                            }]
                        }, {
                            layout: 'hbox',
                            defaults: {
                                padding: 5,
                            },
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: 'Ville',
                                name: 'ville_fact',
                                itemId: 'ville_fact_tf',
                                flex: 1/6
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Province',
                                name: 'province_fact',
                                itemId: 'province_fact_tf',
                                flex: 1/6
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Code postal',
                                regex: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
                                regexText: 'Le format doit être: H0H 0H0',
                                name: 'code_postal_fact',
                                itemId: 'code_postal_fact_tf',
                                flex: 1/6
                            }]
                        }]
                    }]
                }, {
                    xtype: 'fieldset',
                    title: 'Facturation',
                    defaults: {
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false
                    },
                    items: {
                        layout: 'hbox',
                        defaults: {
                            bodyStyle: 'background-color:#dfe8f5',
                            border: false,
                            padding: 5
                        },
                        items: [{
                            xtype: 'radiofield',
                            flex: 0.2,
                            boxLabel: 'Par courriel',
                            name: 'mode_facturation',
                            inputValue: 'courriel',
                            checked: true
                        }, {
                            xtype: 'radiofield',
                            flex: 0.2,
                            boxLabel: 'Par la poste',
                            name: 'mode_facturation',
                            inputValue: 'poste'
                        }, {
                            xtype: 'textfield',
                            flex: 0.6,
                            name: 'mode_facturation_note'
                        }]
                    }
                }, {
                    xtype: 'vin_grid',
                    itemId: 'commande_g',
                    title: 'Commandes faites par ce client',
                    resizable: { handles: 's' },
                    store: Ext.create('VIN.store.Commandes'),
                    load_after_render: false,
                    add_edit_actioncolumn: true,
                    add_delete_actioncolumn: true,
                    column_flex: {
                        no_commande_facture: 1,
                        date_commande: 1,
                        montant: 1,
                        facture_est_envoyee: 1,
                        bon_de_commande_est_envoye: 1
                    },
                    height: grid_height
                }]
            }, {
                // -----------------------------------------------------
                // right part panel
                layout: 'anchor',
                items: [{
                    xtype: 'textarea',
                    fieldLabel: 'Notes',
                    name: 'note_client',
                    anchor: '100%',
                    height: 40,
                    resizable: { handles: 's' },
                    style: 'margin-bottom: 10px'
                }, {
                    xtype: 'fieldset',
                    title: 'Coordonnées de la personne en charge',
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
                            xtype: 'textfield',
                            fieldLabel: 'Nom',
                            name: 'nom_responsable',
                            flex: 0.5
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Téléphone',
                            name: 'no_tel',
                            flex: 0.25
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Téléphone personnel',
                            name: 'no_tel_personnel',
                            flex: 0.25
                        }]
                    }, {
                        layout: 'hbox',
                        defaults: {
                            padding: 5,
                        },
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: 'Fax',
                            name: 'no_fax',
                            flex: 1/3
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Mobile',
                            name: 'no_cellulaire',
                            flex: 1/3
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Courriel',
                            name: 'courriel',
                            flex: 1/3
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
                            flex: 0.1,
                            boxLabel: 'Direct',
                            name: 'expedition',
                            inputValue: 'direct',
                            itemId: 'direct_rb',
                            checked: true
                        }, {
                            xtype: 'combo',
                            flex: 0.3,
                            multiSelect: true,
                            queryMode: 'local',
                            triggerAction: 'all',
                            hideLabel: true,
                            displayField: 'jour',
                            name: 'jours_livraison',
                            forceSelection: true,
                            store: Ext.create('Ext.data.Store', {
                                fields: ['jour'],
                                data: [{jour: 'lundi'}, {jour: 'mardi'}, {jour: 'mercredi'},
                                       {jour: 'jeudi'}, {jour: 'vendredi'}, {jour: 'samedi'}, {jour: 'dimanche'}]
                            })
                        }, {
                            xtype: 'radiofield',
                            flex: 0.15,
                            boxLabel: 'Succursale',
                            name: 'expedition',
                            inputValue: 'succursale',
                            itemId: 'succ_rb'
                        }, {
                            xtype: 'combo',
                            flex: 0.3,
                            displayField: 'no_succursale_saq',
                            name: 'no_succursale_saq',
                            queryCaching: false, // important in case the succs are updated elsewhere
                            store: Ext.create('VIN.store.Succursales'),
                            itemId: 'succ_dd',
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
                            flex: 0.15,
                            boxLabel: 'Pick up',
                            name: 'expedition',
                            inputValue: 'pickup',
                            itemId: 'pickup_rb'
                        }]
                    }]
                }, ci_grid]
            }]
        };

        this.callParent(arguments);
    }

});
