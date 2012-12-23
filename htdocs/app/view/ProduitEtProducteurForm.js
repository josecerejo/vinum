Ext.define('VIN.view.ProduitEtProducteurForm', {

    extend: 'Ext.form.Panel',
    alias: 'widget.pp_form',
    //requires: ['VIN.view.produit.Grid', 'VIN.view.producteur.Grid'],
    autoScroll: true,
    title: 'Produits et producteurs',
    closable: true,
    frame: true,
    fieldDefaults: {
        labelAlign: 'top'
    },

    initComponent: function() {

        var grid_height = 326;

            /*
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
        */

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
                    xtype: 'vin_grid',
                    itemId: 'produit_g',
                    store: Ext.create('VIN.store.Produits'),
                    title: 'Produits',
                    resizable: { handles: 's' },
                    height: grid_height,
                    style: 'margin-bottom: 20px'
                }, {
                    xtype: 'vin_grid',
                    itemId: 'producteur_g',
                    store: Ext.create('VIN.store.Producteurs'),
                    title: 'Producteurs',
                    resizable: { handles: 's' },
                    height: grid_height
                }]
            }, {
                // -----------------------------------------------------
                // right part panel
                layout: 'anchor',
                items: [{
                    xtype: 'fieldset',
                    title: 'Produit',
                    defaults: {
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false
                    },
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
                            allowBlank: false,
                            fieldLabel: 'No produit',
                            readOnly: true,
                            cls: 'x-item-disabled',
                            name: 'no_produit_interne',
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
                            flex: 0.6,
                            fieldLabel: 'Nom du domaine',
                            displayField: 'nom_domaine',
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
                            forceSelection: false,
                            listConfig: {
                                loadingText: 'Recherche...',
                                emptyText: 'Aucun représentant ne correspond à cette recherche..'
                            }


                            xtype: 'combo',
                            allowBlank: false,
                            fieldLabel: 'Nom du domaine',
                            name: 'nom_domaine',
                            flex: 0.6
                        }, {
                            xtype: 'textfield',
                            allowBlank: false,
                            fieldLabel: 'Format',
                            name: 'format',
                            flex: 0.2
                        }, {
                            xtype: 'textfield',
                            allowBlank: false,
                            fieldLabel: 'Couleur',
                            name: 'couleur',
                            flex: 0.2
                        }]
                    }]
                }, {
                    xtype: 'fieldset',
                    title: 'Producteur',
                    defaults: {
                        bodyStyle: 'background-color:#dfe8f5',
                        border: false
                    }
                }]
            }]
        };

        this.callParent(arguments);
    }

});
