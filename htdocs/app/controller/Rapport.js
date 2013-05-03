Ext.define('VIN.controller.Rapport', {

    extend: 'Ext.app.Controller',

    init: function() {

        this.control({

            '#run_rapport_vente_btn': {
                click: function(btn) {
                    var g = btn.up('#rapport_vente_g'),
                    sd = g.down('#start_date_df').getRawValue(),
                    ed = g.down('#end_date_df').getRawValue();
                    if (!sd) {
                        g.down('#start_date_df').markInvalid('Ce champ est requis');
                        return;
                    }
                    g.getStore().load({
                        params: {
                            start_date: sd,
                            end_date: ed,
                            representant_nom: g.down('#representant_nom_dd').getValue(),
                            type_client: g.down('#type_client_dd').getValue()
                        }
                    });
                }
            },

            '#download_rapport_vente_btn': {
                click: function(btn) {
                    var g = btn.up('#rapport_vente_g'),
                    sd = g.down('#start_date_df').getRawValue(),
                    ed = g.down('#end_date_df').getRawValue();
                    if (!sd) {
                        g.down('#start_date_df').markInvalid('Ce champ est requis');
                        return;
                    }
                    var repr = g.down('#representant_nom_dd').getValue();
                    repr =  repr ? repr : '';
                    var tc = g.down('#type_client_dd').getValue();
                    tc =  tc ? tc : '';
                    var url = Ext.String.format('{0}/rapport/vente_download?start_date={1}&end_date={2}&representant_nom={3}&type_client={4}',
                                                ajax_url_prefix, sd, ed, repr, tc);
                    location.href = url;
                }
            },

            '#download_rapport_transaction_btn': {
                click: function(btn) {
                    var g = btn.up('#rapport_transaction_g'),
                    sd = g.down('#start_date_df').getRawValue(),
                    ed = g.down('#end_date_df').getRawValue();
                    if (!sd) {
                        g.down('#start_date_df').markInvalid('Ce champ est requis');
                        return;
                    }
                    var repr = g.down('#representant_nom_dd').getValue();
                    repr =  repr ? repr : '';
                    var tc = g.down('#type_client_dd').getValue();
                    tc =  tc ? tc : '';
                    var url = Ext.String.format('{0}/rapport/transaction_download?start_date={1}&end_date={2}&representant_nom={3}&type_client={4}',
                                                ajax_url_prefix, sd, ed, repr, tc);
                    location.href = url;
                    Ext.getCmp('main_header').getEl().removeCls('x-box-item');
                }
            }

        });
    },

    createRapportVenteGrid: function() {

        var store = Ext.create('VIN.store.Produits', {
            buffered: false,
            remoteSort: false
        });
        store.proxy.url = ajax_url_prefix + '/rapport/vente';

        var g = Ext.getCmp('main_pnl').down('#rapport_vente_g');
        if (!g) {
            g = Ext.create('VIN.view.Grid', {
                itemId: 'rapport_vente_g',
                title: 'Rapport des ventes',
                load_after_render: false,
                closable: true,
                store: store,
                column_flex: {
                    type_vin: 0.35,
                    nom_domaine: 0.35,
                    format: 0.1,
                    quantite_par_caisse: 0.1,
                    quantite_caisse: 0.1
                },
                dockedItems: {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [{
                        xtype: 'datefield',
                        emptyText: 'Date de début',
                        itemId: 'start_date_df'
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'datefield',
                        emptyText: 'Date de fin (opt)',
                        itemId: 'end_date_df'
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'combo',
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
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'combo',
                        name: 'type_client',
                        itemId: 'type_client_dd',
                        queryMode: 'local',
                        triggerAction: 'all',
                        displayField: 'type_client',
                        valueField: 'type_client',
                        emptyText: 'Type de client',
                        forceSelection: false,
                        store: Ext.create('Ext.data.Store', {
                            fields: ['type_client'],
                            data: [{type_client: 'restaurant'},
                                   {type_client: 'particulier'}]
                        })
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'button',
                        iconCls: 'cog-icon',
                        text: 'Voir les données',
                        itemId: 'run_rapport_vente_btn'
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'button',
                        iconCls: 'disk-icon',
                        text: 'Télécharger le rapport',
                        itemId: 'download_rapport_vente_btn'
                    }]
                }
            });
            Ext.getCmp('main_pnl').add(g);
        }
        Ext.getCmp('main_pnl').setActiveTab(g);
    },

    createRapportTransactionGrid: function() {

        // var store = Ext.create('Ext.data.Store', {
        //     model: 'VIN.model.Transaction',
        //     buffered: false,
        //     remoteSort: false,
        //     sorters: [{
        //         property: 'no_commande_facture',
        //         direction: 'ASC'
        //     }],
        //     proxy: {
        //         type: 'ajax',
        //         url: ajax_url_prefix + '/rapport/transaction',
        //         reader: {
        //             type: 'json',
        //             root: 'rows'
        //         }
        //     },
        //     getGroupString: function(instance) {
        //         var group = this.groupers.first();
        //         if (group) {
        //             if (group.property == 'some_property') {
        //                 return instance.get(group.property) + ' (' + instance.get('my_second_property') + ') ';
        //             }
        //             return instance.get(group.property);
        //         }
        //         return '';
        //     }
        // });
        // store.proxy.url = ajax_url_prefix + '/rapport/transaction';

        // bidon store
        var store = Ext.create('VIN.store.Produits', {
            buffered: false,
            remoteSort: false
        });
        store.proxy.url = ajax_url_prefix + '/rapport/transaction';

        var g = Ext.getCmp('main_pnl').down('#rapport_transaction_g');
        if (!g) {
            g = Ext.create('VIN.view.Grid', {
                itemId: 'rapport_transaction_g',
                title: 'Rapport des transactions',
                load_after_render: false,
                closable: true,
                store: store,
                column_flex: {
                },
                dockedItems: {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [{
                        xtype: 'datefield',
                        emptyText: 'Date de début',
                        itemId: 'start_date_df'
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'datefield',
                        emptyText: 'Date de fin (opt)',
                        itemId: 'end_date_df'
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'combo',
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
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'combo',
                        name: 'type_client',
                        itemId: 'type_client_dd',
                        queryMode: 'local',
                        triggerAction: 'all',
                        displayField: 'type_client',
                        valueField: 'type_client',
                        emptyText: 'Type de client',
                        forceSelection: false,
                        store: Ext.create('Ext.data.Store', {
                            fields: ['type_client'],
                            data: [{type_client: 'restaurant'},
                                   {type_client: 'particulier'}]
                        })
                    }, {
                        xtype: 'button',
                        iconCls: 'cog-icon',
                        text: 'Voir les données',
                        itemId: 'run_rapport_transaction_btn',
                        disabled: true
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'button',
                        iconCls: 'disk-icon',
                        text: 'Télécharger le rapport',
                        itemId: 'download_rapport_transaction_btn'
                    }]
                }
            });
            Ext.getCmp('main_pnl').add(g);
        }
        Ext.getCmp('main_pnl').setActiveTab(g);
    }

});
