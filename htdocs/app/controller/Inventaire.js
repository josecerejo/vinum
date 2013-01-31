Ext.define('VIN.controller.Inventaire', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.inventaire.Form'],
    models: ['VIN.model.Inventaire'],
    stores: ['VIN.store.Inventaires'],

    init: function() {

        this.control({

            'inventaire_grid #show_colors_btn': {
                toggle: function(btn, pressed) {
                    var g = btn.up('inventaire_grid');
                    g.use_colors = !g.use_colors;
                    g.getView().refresh();
                }
            },

            'inventaire_grid #type_vin_external_filter_tf': {
                keyup: function(tf, e, opts) {
                    var g = tf.up('inventaire_grid');
                    var tv_filter = g.filters.getFilter('type_vin');
                    if (tf.getValue()) {
                        tv_filter.setValue(tf.getValue());
                        tv_filter.setActive(true);
                    } else {
                        tv_filter.setValue('');
                        tv_filter.setActive(false);
                    }
                }
            },

            '#inventaire_g': {
                selectionchange: function(model, records) {
                    if (records.length == 0) { return; }
                    var ir = records[0];
                    var form = model.view.up('inventaire_form').down('#inventaire_f');
                    form.down('#type_vin_dd').forceSelection = false;
                    form.getForm().loadRecord(ir);
                    form.down('#type_vin_dd').forceSelection = true;
                    form.down('#format_tf').setValue();
                }
            },

            'inventaire_form #save_inv_record_btn': {
                click: function(btn) {
                    var form = btn.up('inventaire_form').down('#inventaire_f');
                    var g = btn.up('inventaire_form').down('#inventaire_g');
                    var selected_ni = g.getSelectionModel().getSelection();
                    if (selected_ni.length == 1) {
                        selected_ni = selected_ni[0].get('no_inventaire');
                    } else {
                        selected_ni = null;
                    }
                    if (form.getForm().isValid()) {
                        form.submit({
                            url: ajax_url_prefix + '/inventaire/save',
                            success: function(_form, action) {
                                btn.up('inventaire_form').down('#inventaire_g').getStore().reload({
                                    callback: function(records, operation, success) {
                                        // reset selection state before load
                                        if (operation && selected_ni) {
                                            var r = g.getStore().query('no_inventaire', selected_ni);
                                            g.getSelectionModel().select(r.items);
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            },

            'inventaire_form #new_inv_record_btn': {
                click: function(btn) {
                    var form = btn.up('#inventaire_f');
                    form.getForm().reset();
                    btn.up('inventaire_form').down('#inventaire_g').getSelectionModel().deselectAll();
                }
            },

            'inventaire_form #del_inv_record_btn': {
                click: function(btn) {
                    var form = btn.up('inventaire_form').down('#inventaire_f');
                    var noi = form.down('#no_inventaire_tf').getValue();
                    if (!noi) { return; }
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir détruire l\'item d\'inventaire #{0}?', noi),
                        Ext.bind(function(_btn) {
                            if (_btn == 'yes') {
                                form.submit({
                                    url: ajax_url_prefix + '/inventaire/delete',
                                    success: function(response) {
                                        btn.up('inventaire_form').down('#inventaire_g').getStore().reload();
                                    }
                                });
                            }
                        }, this));
                }
            }

        });
    },

    createInventaireForm: function() {
        var invf = Ext.getCmp('main_pnl').down('inventaire_form');
        if (!invf) {
            invf = Ext.create('VIN.view.inventaire.Form');
            Ext.getCmp('main_pnl').add(invf);
        }
        Ext.getCmp('main_pnl').setActiveTab(invf);
    }

});
