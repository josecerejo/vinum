Ext.define('VIN.controller.Rapport', {

    extend: 'Ext.app.Controller',

    init: function() {

        this.control({

            '#run_rapport_vente_btn': {
                click: function(btn) {
                    var g = btn.up('#rapport_vente_g'),
                    sd = g.down('#start_date_df').getValue(),
                    ed = g.down('#end_date_df').getValue();
                    if (!sd) {
                        g.down('#start_date_df').markInvalid('Ce champ est requis');
                    }
                    if (!ed) {
                        g.down('#end_date_df').markInvalid('Ce champ est requis');
                    }
                    if (!sd || !ed) { return; }
                    g.getStore().load({
                        params: {
                            start_date: sd,
                            end_date: ed,
                            representant_nom: g.down('#representant_nom_dd').getValue()
                        }
                    });
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

        var g = Ext.create('VIN.view.Grid', {
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
                    emptyText: 'Date de fin',
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
                }, {
                    xtype: 'tbspacer',
                    width: 5
                }, {
                    xtype: 'button',
                    iconCls: 'cog-icon',
                    text: 'Produire le rapport',
                    itemId: 'run_rapport_vente_btn'
                }, {
                    xtype: 'tbspacer',
                    width: 5
                }, {
                    xtype: 'button',
                    iconCls: 'disk-icon',
                    text: 'Télécharger le rapport',
                    disabled: true
                }]
            }
        });
        Ext.getCmp('main_pnl').add(g);
        Ext.getCmp('main_pnl').setActiveTab(g);
    }

});
