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
                    add_delete_actioncolumn: true,
                    column_flex: {
                        type_vin: 2,
                        nom_domaine: 2,
                        format: 1,
                        couleur: 1,
                        quantite_par_caisse: 1,
                        nom_producteur: 2
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
                    add_delete_actioncolumn: true,
                    column_flex: {
                        nom_producteur: 1
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
                        itemId: 'pp_produit_form',
                        items: [{
                        layout: 'hbox',
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false,
                        style: 'margin-bottom: 10px',
                        defaults: {
                            padding: 5
                        },
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: 'No produit',
                            readOnly: true,
                            cls: 'x-item-disabled',
                            name: 'no_produit_interne',
                            itemId: 'no_produit_interne_tf',
                            flex: 0.25
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Type de vin',
                            allowBlank: false,
                            name: 'type_vin',
                            itemId: 'type_vin_tf',
                            flex: 0.75
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
                            flex: 0.75,
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
                                    url: ajax_url_prefix + '/produit/get_nom_domaine',
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
                            xtype: 'combo',
                            allowBlank: false,
                            flex: 0.25,
                            fieldLabel: 'Format',
                            displayField: 'format',
                            name: 'format',
                            allowBlank: false,
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
                        style: 'margin-bottom: 10px',
                        defaults: {
                            padding: 5
                        },
                        items: [{
                            xtype: 'combo',
                            allowBlank: false,
                            name: 'couleur',
                            queryMode: 'local',
                            triggerAction: 'all',
                            displayField: 'couleur',
                            valueField: 'couleur',
                            fieldLabel: 'Couleur',
                            forceSelection: true,
                            flex: 0.2,
                            store: Ext.create('Ext.data.Store', {
                                fields: ['couleur'],
                                data: [{couleur: 'Blanc'},
                                       {couleur: 'Rouge'},
                                       {couleur: 'Rosé'}]
                            }),
                            fieldLabel: 'Couleur',
                            name: 'couleur',
                            flex: 0.3
                        }, {
                            xtype: 'combo',
                            allowBlank: false,
                            flex: 0.4,
                            fieldLabel: 'Pays',
                            displayField: 'pays',
                            name: 'pays',
                            allowBlank: false,
                            store: Ext.create('Ext.data.Store', {
                                fields: ['pays'],
                                proxy: {
                                    type: 'ajax',
                                    limitParam: undefined,
                                    pageParam: undefined,
                                    startParam: undefined,
                                    url: ajax_url_prefix + '/produit/get_pays',
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
                                emptyText: 'Aucun pays trouvé..'
                            }
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: 'Quantité par caisse',
                            name: 'quantite_par_caisse',
                            allowBlank: false,
                            flex: 0.3
                        }]
                    }, {
                        layout: 'hbox',
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false,
                        defaults: {
                            padding: 5
                        },
                        items: [{
                            xtype: 'combo',
                            allowBlank: false,
                            flex: 0.75,
                            displayField: 'nom_producteur',
                            name: 'nom_producteur',
                            itemId: 'nom_producteur_dd',
                            store: Ext.create('VIN.store.Producteurs'),
                            itemId: 'nom_producteur_dd',
                            fieldLabel: 'Nom du producteur',
                            minChars: 3,
                            forceSelection: true,
                            listConfig: {
                                loadingText: 'Recherche...',
                                emptyText: 'Aucun producteur ne correspond à cette recherche..'
                            }
                        }, {
                            xtype: 'tbspacer',
                            flex: 0.25
                        }]
                    }, {
                        layout: 'hbox',
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false,
                        defaults: {
                            padding: 5
                        },
                        items: [{
                            xtype: 'button',
                            text: 'Sauvegarder le produit',
                            iconCls: 'disk-icon',
                            style: 'margin-top: 10px; margin-right: 10px',
                            itemId: 'save_produit_btn'
                        }, {
                            xtype: 'button',
                            text: 'Nouveau produit',
                            iconCls: 'app-form-add-icon',
                            style: 'margin-top: 10px',
                            itemId: 'new_produit_btn'
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
                        itemId: 'pp_producteur_form',
                        items: [{
                        layout: 'hbox',
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false,
                        style: 'margin-bottom: 10px',
                        defaults: {
                            padding: 5
                        },
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: 'No producteur',
                            readOnly: true,
                            cls: 'x-item-disabled',
                            name: 'no_producteur',
                            itemId: 'no_producteur_tf',
                            flex: 0.25
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Nom du producteur',
                            allowBlank: false,
                            name: 'nom_producteur',
                            itemId: 'nom_producteur_tf',
                            flex: 0.75
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
                            name: 'code_postal'
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
                            xtype: 'textfield',
                            fieldLabel: 'Comté',
                            name: 'comte'
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Pays',
                            name: 'pays'
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
                        defaults: {
                            padding: 5
                        },
                        items: [{
                            xtype: 'button',
                            text: 'Sauvegarder le producteur',
                            itemId: 'save_producteur_btn',
                            iconCls: 'disk-icon',
                            style: 'margin-top: 10px; margin-right: 10px'
                        }, {
                            xtype: 'button',
                            text: 'Filtrer ses produits',
                            iconCls: 'drink-icon',
                            itemId: 'filter_produits_btn',
                            style: 'margin-top: 10px; margin-right: 10px'
                        }, {
                            xtype: 'button',
                            text: 'Nouveau producteur',
                            iconCls: 'app-form-add-icon',
                            style: 'margin-top: 10px',
                            itemId: 'new_producteur_btn'
                        }]
                    }]
                    }
                }]
            }]
        };

        this.callParent(arguments);
    }

});
