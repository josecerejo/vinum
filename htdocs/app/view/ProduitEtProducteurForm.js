Ext.define('VIN.view.ProduitEtProducteurForm', {

    extend: 'Ext.form.Panel',
    alias: 'widget.pp_forms',
    autoScroll: true,
    title: 'Produits et producteurs',
    closable: true,
    frame: true,

    initComponent: function() {

        var grid_height = 326;

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
                items: [{
                    xtype: 'vin_grid',
                    itemId: 'produit_g',
                    store: Ext.create('VIN.store.Produits'),
                    title: 'Produits',
                    resizable: { handles: 's' },
                    height: grid_height,
                    style: 'margin-bottom: 20px',
                    column_flex: {
                        type_vin: 2,
                        format: 1,
                        couleur: 1,
                        quantite_par_caisse: 1,
                        nom_producteur: 2,
                        est_actif: 0.5
                    },
                    dockedItems: {
                        xtype: 'toolbar',
                        dock: 'top',
                        items: [{
                            text: 'Tous les produits',
                            itemId: 'all_produits_btn'
                        }]
                    }
                }, {
                    xtype: 'vin_grid',
                    itemId: 'producteur_g',
                    store: Ext.create('VIN.store.Producteurs'),
                    title: 'Producteurs',
                    resizable: { handles: 's' },
                    height: grid_height,
                    column_flex: {
                        nom_producteur: 1,
                        nom_domaine: 1,
                        region: 0.5,
                        pays: 0.25
                    }
                }]
            }, {
                // -----------------------------------------------------
                // right part panel
                items: [{
                    xtype: 'fieldset',
                    title: 'Produit',
                    height: grid_height,
                    style: 'margin-bottom: 20px',
                    defaults: {
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false
                    },
                    items: {
                        xtype: 'form',
                        header: false,
                        fieldDefaults: {
                            labelAlign: 'top'
                        },
                        itemId: 'pp_produit_f',
                        items: [{
                            xtype: 'hidden',
                            name: 'no_produit_interne',
                            itemId: 'no_produit_interne_hidden'
                        }, {
                            layout: 'hbox',
                            bodyStyle: 'background-color:#dfe8f5',
                            border: false,
                            style: 'margin-bottom: 10px',
                            defaults: {
                                padding: 5,
                                flex: 0.5
                            },
                            items: [/*{
                                xtype: 'textfield',
                                fieldLabel: 'No produit',
                                readOnly: true,
                                cls: 'x-item-disabled',
                                name: 'no_produit_interne',
                                itemId: 'no_produit_interne_tf',
                                flex: 0.25
                            },*/ {
                                xtype: 'combo',
                                displayField: 'type_vin',
                                name: 'type_vin',
                                store: Ext.create('VIN.store.Produits'),
                                itemId: 'type_vin_dd',
                                fieldLabel: '<b>Type de vin</b>',
                                minChars: 3,
                                forceSelection: false,
                                allowBlank: false,
                                pageSize: 10,
                                listConfig: {
                                    loadingText: 'Recherche...',
                                    emptyText: 'Aucun produit ne correspond à cette recherche..'
                                }
                            }, {
                                xtype: 'combo',
                                allowBlank: false,
                                displayField: 'nom_producteur',
                                name: 'nom_producteur',
                                itemId: 'nom_producteur_dd',
                                store: Ext.create('VIN.store.Producteurs'),
                                itemId: 'nom_producteur_dd',
                                fieldLabel: 'Nom du producteur',
                                minChars: 3,
                                forceSelection: true,
                                allowBlank: false,
                                listConfig: {
                                    loadingText: 'Recherche...',
                                    emptyText: 'Aucun producteur ne correspond à cette recherche..'
                                }
                            }]
                        }, {
                            layout: 'hbox',
                            bodyStyle: 'background-color:#dfe8f5',
                            border: false,
                            style: 'margin-bottom: 10px',
                            defaults: {
                                padding: 5
                            },
                            items: [{
                                xtype: 'combo',
                                allowBlank: false,
                                flex: 0.33,
                                fieldLabel: 'Format',
                                displayField: 'format',
                                name: 'format',
                                itemId: 'format_dd',
                                forceSelection: true,
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
                                listConfig: {
                                    loadingText: 'Recherche...',
                                    emptyText: 'Aucun format trouvé..'
                                }
                            }, {
                                xtype: 'combo',
                                allowBlank: false,
                                name: 'couleur',
                                queryMode: 'local',
                                triggerAction: 'all',
                                displayField: 'couleur',
                                valueField: 'couleur',
                                fieldLabel: 'Couleur',
                                forceSelection: true,
                                flex: 0.33,
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['couleur'],
                                    data: [{couleur: 'Blanc'},
                                           {couleur: 'Rouge'},
                                           {couleur: 'Rosé'}]
                                })
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Quantité par caisse',
                                name: 'quantite_par_caisse',
                                allowBlank: false,
                                flex: 0.33
                            }]
                        }, {
                            layout: 'hbox',
                            bodyStyle: 'background-color:#dfe8f5',
                            border: false,
                            style: 'margin-bottom: 5px; margin-top: 15px',
                            defaults: {
                                padding: 5
                            },
                            items: [{
                                xtype: 'checkbox',
                                boxLabel: 'Est actif (i.e. visible dans les listes de prix)',
                                name: 'est_actif',
                                itemId: 'est_actif_cb',
                                style: 'margin-top: 20px',
                                checked: true
                            }, {
                                xtype: 'checkbox',
                                boxLabel: 'Est en disponibilité réduite',
                                name: 'est_en_dispo_reduite',
                                itemId: 'est_en_dispo_reduite_cb',
                                style: 'margin-top: 20px',
                                checked: false
                            }]
                        }, {
                            layout: 'hbox',
                            bodyStyle: 'background-color:#dfe8f5',
                            border: false,
                            style: 'margin-bottom: 5px; margin-top: 75px',
                            defaults: {
                                padding: 5
                            },
                            items: [{
                                xtype: 'button',
                                text: 'Sauvegarder',
                                iconCls: 'disk-icon',
                                itemId: 'save_produit_btn'
                            }, {
                                xtype: 'button',
                                text: 'Nouveau',
                                iconCls: 'app-form-add-icon',
                                itemId: 'new_produit_btn',
                                style: 'margin-left: 5px'
                            }, {
                                xtype: 'button',
                                text: 'Détruire',
                                itemId: 'del_produit_btn',
                                iconCls: 'del-icon',
                                style: 'margin-left: 5px'
                            }]
                        }]
                    }
                }, {
                    xtype: 'fieldset',
                    title: 'Producteur',
                    height: grid_height,
                    defaults: {
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false
                    },
                    items: {
                        xtype: 'form',
                        header: false,
                        fieldDefaults: {
                            labelAlign: 'top'
                        },
                        itemId: 'pp_producteur_f',
                        items: [{
                            xtype: 'hidden',
                            name: 'no_producteur',
                            itemId: 'no_producteur_hidden'
                        }, {
                            layout: 'hbox',
                            bodyStyle: 'background-color:#dfe8f5',
                            border: false,
                            style: 'margin-bottom: 10px',
                            defaults: {
                                padding: 5,
                                flex: 1/3
                            },
                            items: [/*{
                                xtype: 'textfield',
                                fieldLabel: 'No producteur',
                                readOnly: true,
                                cls: 'x-item-disabled',
                                name: 'no_producteur',
                                itemId: 'no_producteur_tf',
                                flex: 0.25
                            },*/ {
                                xtype: 'combo',
                                displayField: 'nom_producteur',
                                name: 'nom_producteur',
                                itemId: 'nom_producteur_dd',
                                store: Ext.create('VIN.store.Producteurs'),
                                itemId: 'nom_producteur_dd',
                                fieldLabel: '<b>Nom du producteur</b>',
                                minChars: 3,
                                forceSelection: false, // allowed to create here
                                allowBlank: false,
                                pageSize: 10,
                                listConfig: {
                                    loadingText: 'Recherche...',
                                    emptyText: 'Aucun produit ne correspond à cette recherche..'
                                }
                        }, {
                            xtype: 'combo',
                            fieldLabel: 'Nom du domaine',
                            displayField: 'nom_domaine',
                            name: 'nom_domaine',
                            allowBlank: false,
                            store: Ext.create('Ext.data.Store', {
                                fields: ['nom_domaine'],
                                proxy: {
                                    type: 'ajax',
                                    limitParam: undefined,
                                    pageParam: undefined,
                                    startParam: undefined,
                                    url: ajax_url_prefix + '/producteur/get_domaine',
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
                                emptyText: 'Aucun domaine avec ce nom..'
                            }
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Nom du responsable',
                            name: 'nom_responsable'
                        }]
                        }, {
                            layout: 'hbox',
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false,
                        style: 'margin-bottom: 10px',
                        defaults: {
                            padding: 5,
                            flex: 1/4
                        },
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: 'No civique',
                            name: 'no_civique'
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Rue',
                            name: 'rue'
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Ville',
                            name: 'ville'
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Code postal',
                            name: 'code_postal',
                            regex: /^[A-Z]\d[A-Z] \d[A-Z]\d$|^\d{4,5}$/,
                            regexText: 'Le format doit être: H0H 0H0 ou 1234[5]',
                        }]
                    }, {
                        layout: 'hbox',
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false,
                        style: 'margin-bottom: 10px',
                        defaults: {
                            padding: 5,
                            flex: 1/3
                        },
                        items: [{
                            xtype: 'combo',
                            allowBlank: false,
                            fieldLabel: 'Comté',
                            displayField: 'comte',
                            name: 'comte',
                            itemId: 'comte_dd',
                            allowBlank: true,
                            forceSelection: false, // open list!
                            store: Ext.create('Ext.data.Store', {
                                fields: ['comte'],
                                proxy: {
                                    type: 'ajax',
                                    limitParam: undefined,
                                    pageParam: undefined,
                                    startParam: undefined,
                                    url: ajax_url_prefix + '/producteur/get_comte',
                                    reader: {
                                        type: 'json',
                                        root: 'rows'
                                    }
                                }
                            }),
                            minChars: 2,
                            listConfig: {
                                loadingText: 'Recherche...',
                                emptyText: 'Aucun comté trouvé..'
                            }
                        }, {
                            xtype: 'combo',
                            allowBlank: false,
                            fieldLabel: 'Région',
                            displayField: 'region',
                            name: 'region',
                            itemId: 'region_dd',
                            allowBlank: false,
                            forceSelection: true, // closed list!
                            store: Ext.create('Ext.data.Store', {
                                fields: ['region'],
                                proxy: {
                                    type: 'ajax',
                                    limitParam: undefined,
                                    pageParam: undefined,
                                    startParam: undefined,
                                    url: ajax_url_prefix + '/producteur/get_region',
                                    reader: {
                                        type: 'json',
                                        root: 'rows'
                                    }
                                }
                            }),
                            minChars: 2,
                            listConfig: {
                                loadingText: 'Recherche...',
                                emptyText: 'Aucune région trouvée..'
                            }
                        }, {
                            xtype: 'combo',
                            allowBlank: false,
                            fieldLabel: 'Pays',
                            displayField: 'pays',
                            name: 'pays',
                            itemId: 'pays_dd',
                            allowBlank: false,
                            forceSelection: true, // closed list!
                            store: Ext.create('Ext.data.Store', {
                                fields: ['pays'],
                                proxy: {
                                    type: 'ajax',
                                    limitParam: undefined,
                                    pageParam: undefined,
                                    startParam: undefined,
                                    url: ajax_url_prefix + '/producteur/get_pays',
                                    reader: {
                                        type: 'json',
                                        root: 'rows'
                                    }
                                }
                            }),
                            minChars: 2,
                            listConfig: {
                                loadingText: 'Recherche...',
                                emptyText: 'Aucun pays trouvé..'
                            }
                        }]
                    }, {
                        layout: 'hbox',
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false,
                        style: 'margin-bottom: 10px',
                        defaults: {
                            padding: 5,
                            flex: 1/3
                        },
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: 'Courriel',
                            name: 'courriel',
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'No téléphone',
                            name: 'no_tel'
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'No fax',
                            name: 'no_fax'
                        }]
                    }, {
                        layout: 'hbox',
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false,
                        style: 'margin-bottom: 5px; margin-top: 15px',
                        defaults: {
                            padding: 5
                        },
                        items: [{
                            xtype: 'button',
                            text: 'Sauvegarder',
                            itemId: 'save_producteur_btn',
                            iconCls: 'disk-icon'
                        }, {
                            xtype: 'button',
                            text: 'Nouveau',
                            iconCls: 'app-form-add-icon',
                            style: 'margin-top: 10px',
                            itemId: 'new_producteur_btn',
                            style: 'margin-left: 5px'
                        }, {
                            xtype: 'button',
                            text: 'Détruire',
                            itemId: 'del_producteur_btn',
                            iconCls: 'del-icon',
                            style: 'margin-left: 5px'
                        }]
                    }]
                    }
                }]
            }]
        };

        this.callParent(arguments);
    }

});
