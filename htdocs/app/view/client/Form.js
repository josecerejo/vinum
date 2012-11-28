Ext.define('VIN.view.client.Form', {

    extend: 'Ext.form.Panel',
    alias: 'widget.client_form',
    autoScroll: true,
    title: 'Client',
    closable: true,
    frame: true,
    url: ajax_url_prefix + '/client/get',
    fieldDefaults: {
        labelAlign: 'top'
    },

    initComponent: function() {

        // stores
        var client_search_store = Ext.create('VIN.store.Clients');

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
                        flex: 0.7,
                        displayField: 'nom_social',
                        name: 'nom_social',
                        store: client_search_store,
                        itemId: 'client_combo',
                        fieldLabel: 'Client',
                        minChars: 3,
                        forceSelection: false, // important if we want to allow client creation
                        listConfig: {
                            loadingText: 'Recherche...',
                            emptyText: 'Aucun client ne correspond à cette recherche..',
                            getInnerTpl: function() {
                                return '<span style="display:inline-block; width:80% !important">{nom_social}</span>' +
                                       '<span style="display:inline-block; width:20% !important">{no_client_saq}</span>';
                            }
                        },
                        pageSize: 10,
                        style: 'margin-bottom: 10px;'
                    }, {
                        xtype: 'combo',
                        name: 'type_client',
                        itemId: 'type_client_combo',
                        queryMode: 'local',
                        triggerAction: 'all',
                        displayField: 'type_client_desc',
                        valueField: 'type_client',
                        fieldLabel: 'Type de client',
                        forceSelection: true,
                        flex: 0.2,
                        store: Ext.create('Ext.data.Store', {
                            fields: ['type_client_desc', 'type_client'],
                            data: [{type_client_desc: 'Restaurant', type_client: '1'},
                                   {type_client_desc: 'Particulier', type_client: '2'}]
                        })                        
                    }, {
                        flex: 0.2,
                        xtype: 'datefield',
                        fieldLabel: "Création",
                        name: 'date_ouverture_dossier',
                        format: 'Y-m-d'
                        //value: new Date()
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
                        fieldLabel: 'No client',
                        disabled: true,
                        name: 'no_client',
                        flex: 0.3
                    }, {
                        xtype: 'combo',
                        flex: 0.4,
                        fieldLabel: 'Représentant',
                        displayField: 'representant_nom',
                        name: 'representant_nom',
                        store: Ext.create('Ext.data.Store', {
                            model: Ext.define('VIN.model.Representant', {
                                extend: 'Ext.data.Model',
                                fields: ['representant_nom']
                            }),
                            proxy: {
                                type: 'ajax',
                                limitParam: undefined,
                                pageParam: undefined,
                                startParam: undefined,
                                url: ajax_url_prefix + '/misc/get_representants',
                                reader: {
                                    type: 'json',
                                    root: 'rows'
                                }
                            }                                    
                        }),
                        minChars: 3,                            
                        forceSelection: true, 
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
                                flex: 0.1
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Rue',
                                name: 'rue',
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
                                flex: 1/6
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Province',
                                name: 'province',
                                flex: 1/6
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Code postal',
                                name: 'code_postal', 
                                flex: 1/6
                            }]
                        }]
                    }, {
                        xtype: 'button',
                        scale: 'small',
                        iconCls: 'arrow-right-icon',
                        style: 'margin-right: 5px; margin-left: 5px; margin-top: 51px'
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
                                flex: 0.1
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Rue',
                                name: 'rue_fact',
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
                                flex: 1/6
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Province',
                                name: 'province_fact',
                                flex: 1/6
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Code postal',
                                name: 'code_postal_fact', 
                                flex: 1/6
                            }]
                        }]
                    }]
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
                            fieldLabel: 'Portable',
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
                                    url: ajax_url_prefix + '/commande/get_succursales',
                                    reader: {
                                        type: 'json',
                                        root: 'rows'
                                    }
                                }                                    
                            }),
                            itemId: 'succ_combo',
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
                            namme: 'date_pickup',
                            format: 'Y-m-d',
                            flex: 0.1,
                            itemId: 'pickup_df'
                        }]
                    }]
                }, {                   
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,                    
                    defaults: {
                        xtype: 'button',
                        padding: 5,
                        style: 'margin-bottom: 20px; margin-top: 10px; margin-right: 10px'
                    },
                    items: [{
                        text: 'Sauvegarder',
                        itemId: 'save_btn',
                        iconCls: 'disk-icon'                        
                    }]
                }]
            }, {
                // -----------------------------------------------------
                // right part panel
                layout: 'anchor',
                items: []
            }]
        };

        this.callParent(arguments);
    }

});
