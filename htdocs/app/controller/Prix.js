Ext.define('VIN.controller.Prix', {

    extend: 'Ext.app.Controller',

    init: function() {

        this.control({

            '#prix_g #couleur_external_filter_dd': {
                change: function(field, e, opts) {
                    var g = field.up('#prix_g');
                    VIN.view.Grid.applyExternalGridFilter(g, field, 'couleur');
                }
            },

            '#prix_g #pays_external_filter_dd': {
                change: function(field, records, eopts) {
                    var g = field.up('#prix_g');
                    VIN.view.Grid.applyExternalGridFilter(g, field, 'pays');
                }
            },

            '#prix_g #type_client_particulier_rb': {
                change: function(field, is_particulier) {
                    var g = field.up('#prix_g');
                    g.getStore().getProxy().extraParams = {
                        type_client: is_particulier ? 'particulier' : 'restaurant'
                    };
                    g.getStore().reload();
                }
            },

            '#prix_g #download_liste_prix_btn': {
                click: function(btn) {
                    var g = btn.up('#prix_g');
                    var sels = Ext.Array.map(g.getSelectionModel().getSelection(),
                                             function(rec) {
                                                 return rec.get('no_produit_interne')
                                             });
                    var dummy_form = Ext.create('Ext.form.Panel');

                    var filters = Ext.Array.map(g.filters.getFilterData(),
                                               function(o) {
                                                   return {
                                                       field: o.field,
                                                       type: o.data.type,
                                                       value: o.data.value
                                                   };
                                               });
                    var sorters = Ext.Array.map(g.getStore().sorters.items,
                                             function(o) {
                                                 return {
                                                     property: o.property,
                                                     direction: o.direction
                                                   };
                                               });

                    dummy_form.submit({
                        url: ajax_url_prefix + '/produit/download_liste_prix',
                        standardSubmit: true,
                        params: {
                            selected: Ext.JSON.encode(sels),
                            filter: Ext.JSON.encode(filters),
                            sort: Ext.JSON.encode(sorters),
                            type_client: g.getStore().getProxy().extraParams.type_client,
                            representant_nom: g.down('#representant_nom_dd').getValue()
                        }
                    });
                }
            }

        });
    },

    createPrixTab: function() {
        var pt = Ext.create('Ext.panel.Panel', {
            title: 'Liste de prix',
            closable: true,
            layout: 'fit',
            header: false,
            items: Ext.create('VIN.view.Grid', {
                itemId: 'prix_g',
                store: Ext.create('Ext.data.Store', {
                    model: 'VIN.model.Produit',
                    //remotesort: true,
                    // sorters: [{
                    //     property: 'pays',
                    //     direction: 'ASC'
                    // }, {
                    //     property: 'couleur',
                    //     direction: 'ASC'
                    // }, {
                    //     property: 'type_vin',
                    //     direction: 'ASC'
                    // }],
                    proxy: {
                        type: 'ajax',
                        url: ajax_url_prefix + '/produit/get_prix',
                        reader: {
                            type: 'json',
                            root: 'rows'
                        }
                    }
                }),
                selModel: Ext.create('Ext.selection.CheckboxModel'),
                column_flex: [['pays', 1], ['couleur', 1], ['type_vin', 2], ['millesime', 1],
                              ['nom_domaine', 2], ['region', 2], ['quantite_par_caisse', 1],
                              ['format', 1], ['prix', 1]],
                sortable: false,
                dockedItems: {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [{
                        xtype: 'clearablecombo',
                        emptyText: 'Filtrer par pays',
                        displayField: 'pays',
                        itemId: 'pays_external_filter_dd',
                        name: 'pays',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['pays'],
                            proxy: {
                                type: 'ajax',
                                limitParam: undefined,
                                pageParam: undefined,
                                startParam: undefined,
                                url: ajax_url_prefix + '/producteur/get_pays',
                                extraParams: {
                                    add_nouveau_monde: true
                                },
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
                            emptyText: 'Aucun pays ne correspond à cette recherche..'
                        }
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'clearablecombo',
                        emptyText: 'Filter par couleur',
                        displayField: 'couleur',
                        itemId: 'couleur_external_filter_dd',
                        name: 'couleur',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['couleur'],
                            data: [{couleur: 'Rouge'},
                                   {couleur: 'Blanc'},
                                   {couleur: 'Rosé'}]
                        })
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'clearablecombo',
                        emptyText: 'Représentant',
                        displayField: 'representant_nom',
                        name: 'representant_nom',
                        itemId: 'representant_nom_dd',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['representant_nom'],
                            proxy: {
                                type: 'ajax',
                                limitParam: undefined,
                                pageParam: undefined,
                                startParam: undefined,
                                url: ajax_url_prefix + '/representant/get',
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
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'radiofield',
                        boxLabel: 'Particuliers',
                        itemId: 'type_client_particulier_rb',
                        name: 'type_client',
                        inputValue: 'particulier',
                        checked: true
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'radiofield',
                        boxLabel: 'Restaurateurs',
                        itemId: 'type_client_restaurant_rb',
                        name: 'type_client',
                        inputValue: 'restaurant'
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'button',
                        iconCls: 'disk-icon',
                        text: 'Télécharger la liste',
                        itemId: 'download_liste_prix_btn'
                    }]
                }
            })
        });

        var g = pt.down('#prix_g');
        g.getStore().getProxy().extraParams = {
            type_client: 'particulier'
        };
        // g.getStore().on('load', function(store, records, successful, options) {
        //     g.getSelectionModel().selectAll();
        // });

        if (current_user.representant_id) {
            var rdd = g.down('#representant_nom_dd');
            rdd.setValue(current_user.usager_nom);
            rdd.setDisabled(true);
        }

        Ext.getCmp('main_pnl').add(pt);
        Ext.getCmp('main_pnl').setActiveTab(pt);

        return pt;
    }

});
