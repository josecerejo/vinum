Ext.define('VIN.controller.Backorder', {

    extend: 'Ext.app.Controller',

    init: function() {

        this.control({

            '#backorder_g actioncolumn': {
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    this.deleteBO();
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
                    var f = backorder_win.down('#backorder_f');
                    f.getForm().reset();
                    f.down('#client_dd').removeCls('x-item-disabled');
                    f.down('#produit_dd').removeCls('x-item-disabled');
                    backorder_win.down('#del_btn').setDisabled(true);
                    backorder_win.show();
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
                    this.deleteBO();
                }
            }

        });
    },

    deleteBO: function() {
        var f = backorder_win.down('#backorder_f');
        Ext.Msg.confirm('Vinum', Ext.String.format("Êtes-vous certain de vouloir détruire ce BO ('{0}' pour '{1}')?",
                                                   f.down('#produit_dd').getValue(), f.down('#client_dd').getValue()),
                        Ext.bind(function(btn) {
                            if (btn == 'yes') {
                                var dummy_form = Ext.create('Ext.form.Panel');
                                dummy_form.submit({
                                    url: ajax_url_prefix + '/backorder/remove',
                                    params: {
                                        backorder_id: f.down('#backorder_id_hd').getValue()
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

    editBO: function(rec) {
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
                f.down('#client_dd').addCls('x-item-disabled');
                f.down('#produit_dd').forceSelection = true;
                f.down('#produit_dd').addCls('x-item-disabled');
                backorder_win.down('#del_btn').setDisabled(false);
            }
        });
    },

    createBOGrid: function() {
        var g = Ext.getCmp('main_pnl').down('#backorder_g');
        if (!g) {
            g = Ext.create('VIN.view.Grid', {
                itemId: 'backorder_g',
                title: 'Ruptures de stock (BOs)',
                closable: true,
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
                    }]
                }
            });
            Ext.getCmp('main_pnl').add(g);
        }
        Ext.getCmp('main_pnl').setActiveTab(g);
    }


});
