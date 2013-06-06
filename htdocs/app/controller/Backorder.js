Ext.define('VIN.controller.Backorder', {

    extend: 'Ext.app.Controller',

    init: function() {

        this.control({

            '#backorder_g actioncolumn': {
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    this.deleteBO(rec);
                },
                edit_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    this.editBO(rec);
                }
            },

            '#backorder_g': {
                itemdblclick: function(view, rec, item, index, e, eOpts) {
                    this.editBO(rec);
                }
            },

            '#backorder_g #add_bo_btn': {
                click: function(btn) {
                    this.popNewWindow();
                }
            },

            '#backorder_w #save_btn': {
                click: function(btn) {
                    var f = backorder_win.down('#backorder_f');
                    if (!f.getForm().isValid()) { return; }
                    f.submit({
                        url: ajax_url_prefix + '/backorder/save',
                        success: function(_form, action) {
                            var g = Ext.getCmp('main_pnl').down('#backorder_g');
                            if (g) {
                                g.getStore().load();
                            }
                            backorder_win.hide();
                        }
                    });
                }
            },

            '#backorder_w #del_btn': {
                click: function(btn) {
                    var f = backorder_win.down('#backorder_f');
                    var rec = Ext.create('VIN.model.Backorder', f.getForm().getFieldValues());
                    this.deleteBO(rec);
                }
            },

            '#backorder_g #type_vin_external_filter_tf': {
                change: function(field, e, opts) {
                    var g = field.up('#backorder_g');
                    VIN.view.Grid.applyExternalGridFilter(g, field, 'type_vin');
                }
            },

            '#backorder_g #repr_external_filter_dd': {
                change: function(field, records, eopts) {
                    var g = field.up('#backorder_g');
                    VIN.view.Grid.applyExternalGridFilter(g, field, 'representant_nom');
                }
            }

        });
    },

    deleteBO: function(rec) {
        var f = backorder_win.down('#backorder_f');
        if (rec.get('type_vin')) {
            var msg = Ext.String.format("Êtes-vous certain de vouloir détruire ce BO ('{0}' pour '{1}')?",
                                        rec.get('type_vin'), rec.get('nom_social'));
        } else {
            var msg = "Êtes-vous certain de vouloir détruire ce BO?";
        }
        Ext.Msg.confirm('Vinum', msg, Ext.bind(function(btn) {
            if (btn == 'yes') {
                var dummy_form = Ext.create('Ext.form.Panel');
                dummy_form.submit({
                    url: ajax_url_prefix + '/backorder/remove',
                    params: {
                        backorder_id: rec.get('backorder_id')
                    },
                    success: function(_form, action) {
                        var g = Ext.getCmp('main_pnl').down('#backorder_g');
                        if (g) {
                            g.getStore().load();
                        }
                        backorder_win.hide();
                    }
                });
            }
        }, this));
    },

    editBO: function(rec, win_title) {
        var f = backorder_win.down('#backorder_f');
        f.down('#client_dd').forceSelection = false;
        f.down('#produit_dd').forceSelection = false;
        f.load({
            url: ajax_url_prefix + '/backorder/load',
            params: {
                backorder_id: rec.get('backorder_id')
            },
            success: function(_form, action) {
                backorder_win.show();
                f.down('#client_dd').forceSelection = true;
                f.down('#client_dd').setDisabled(true);
                f.down('#produit_dd').forceSelection = true;
                f.down('#produit_dd').setDisabled(true);
                backorder_win.down('#del_btn').setDisabled(false);
                if (win_title !== undefined) {
                    backorder_win.setTitle(win_title);
                } else {
                    backorder_win.setTitle('Rupture de stock (BO)');
                }
            }
        });
    },

    createTab: function() {
        var bot = Ext.create('Ext.panel.Panel', {
            title: 'Ruptures de stock (BOs)',
            closable: true,
            layout: 'fit',
            header: false,
            items: Ext.create('VIN.view.Grid', {
                itemId: 'backorder_g',
                store: Ext.create('VIN.store.Backorders'),
                add_delete_actioncolumn: true,
                add_edit_actioncolumn: true,
                column_flex: {
                    type_vin: 2,
                    format: 0.75,
                    date_bo: 1,
                    nom_social: 2,
                    representant_nom: 1.5,
                    quantite_caisse: 0.75,
                    quantite_bouteille: 0.75
                },
                dockedItems: {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [{
                        xtype: 'button',
                        iconCls: 'add-icon',
                        text: 'Créer un BO',
                        itemId: 'add_bo_btn'
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'clearabletextfield',
                        enableKeyEvents: true,
                        emptyText: 'Filtrer par type de vin',
                        itemId: 'type_vin_external_filter_tf',
                        width: 200
                    }, {
                        xtype: 'tbspacer',
                        width: 5
                    }, {
                        xtype: 'clearablecombo',
                        emptyText: 'Représentant',
                        displayField: 'representant_nom',
                        itemId: 'repr_external_filter_dd',
                        name: 'representant_nom',
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
                    }]
                }
            })
        });
        Ext.getCmp('main_pnl').add(bot);
        Ext.getCmp('main_pnl').setActiveTab(bot);
        return bot;
    },

    popNewWindow: function() {
        var f = backorder_win.down('#backorder_f');
        f.getForm().reset();
        f.down('#client_dd').setDisabled(false);
        f.down('#produit_dd').setDisabled(false);
        backorder_win.down('#del_btn').setDisabled(true);
        backorder_win.show();
    }

});
