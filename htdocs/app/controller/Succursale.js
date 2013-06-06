Ext.define('VIN.controller.Succursale', {

    extend: 'Ext.app.Controller',

    init: function() {

        this.control({

            '#succ_g': {
                edit: function(editor, obj) {
                    var dummy_form = Ext.create('Ext.form.Panel');
                    dummy_form.submit({
                        url: ajax_url_prefix + '/succursale/save',
                        params: obj.record.data
                    });
                }
            },

            '#succ_g #add_succ_btn': {
                click: function(btn) {
                    var g = btn.up('grid');
                    var rec = Ext.create('VIN.model.Succursale');
                    g.getStore().insert(0, rec);
                    g.getPlugin('row_editing').startEdit(0, 0);
                }
            },

            '#succ_g actioncolumn': {
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    var f = backorder_win.down('#backorder_f');
                    Ext.Msg.confirm('Vinum', Ext.String.format("Êtes-vous certain de vouloir détruire la succursale {0}?",
                                                               rec.get('no_succursale_saq')),
                                    Ext.bind(function(btn) {
                                        if (btn == 'yes') {
                                            var dummy_form = Ext.create('Ext.form.Panel');
                                            dummy_form.submit({
                                                url: ajax_url_prefix + '/succursale/remove',
                                                params: rec.data,
                                                success: function(_form, action) {
                                                    var g = Ext.getCmp('main_pnl').down('#succ_g');
                                                    if (g) {
                                                        g.getStore().load();
                                                    }
                                                }
                                            });
                                        }
                                    }, this));
                }
            }

        });
    },

    createTab: function() {
        var g = Ext.getCmp('main_pnl').down('#succ_g');
        if (!g) {
            g = Ext.create('VIN.view.Grid', {
                itemId: 'succ_g',
                title: 'Succursales SAQ',
                closable: true,
                store: Ext.create('VIN.store.Succursales'),
                add_delete_actioncolumn: true,
                column_flex: {
                    no_succursale_saq: 0.1,
                    adresse: 0.6,
                    ville: 0.3
                },
                dockedItems: {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [{
                        xtype: 'button',
                        iconCls: 'add-icon',
                        text: 'Ajouter une succursale',
                        itemId: 'add_succ_btn'
                    }]
                },
                plugins: [Ext.create('Ext.grid.plugin.RowEditing', {
                    clicksToMoveEditor: 1,
                    pluginId: 'row_editing'
                })]
            });
            Ext.getCmp('main_pnl').add(g);
        }
        Ext.getCmp('main_pnl').setActiveTab(g);
    }

});
