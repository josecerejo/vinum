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
                    var g = btn.up('inventaire_grid');
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
                    var form = model.view.up('inventaire_form').down('#inventaire_f');
                    form.down('#type_vin_dd').forceSelection = false;
                    form.getForm().loadRecord(records[0]);
                    form.down('#type_vin_dd').forceSelection = true;
                }
            },

            'inventaire_form #new_inv_record_btn': {
                click: function(btn) {
                    var form = btn.up('#inventaire_f');
                    form.getForm().reset();
                }
            }

        });
    },

    // _getFormViewInstance: function(any_contained_view) {
    //     return any_contained_view.up('inventaire_grid');
    // },

    createInventaireForm: function() {
        var invf = Ext.create('VIN.view.inventaire.Form');
        Ext.getCmp('main_pnl').add(invf);
        Ext.getCmp('main_pnl').setActiveTab(invf);
    }

});
