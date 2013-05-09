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
                change: function(field, e, opts) {
                    var g = field.up('inventaire_grid');
                    VIN.view.Grid.applyExternalGridFilter(g, field, 'type_vin');
                }
            },

            'inventaire_grid #producteur_external_filter_tf': {
                change: function(field, e, opts) {
                    var g = field.up('inventaire_grid');
                    VIN.view.Grid.applyExternalGridFilter(g, field, 'nom_producteur');
                }
            },

            'inventaire_grid #no_produit_saq_external_filter_tf': {
                change: function(field, e, opts) {
                    // this numerical filter doesn't seem to be affected by this bug:
                    // http://stackoverflow.com/questions/9629531/apply-grid-filter-programmatically-from-function
                    var g = field.up('inventaire_grid');
                    var nps_filter = g.filters.getFilter('no_produit_saq');
                    if (field.getValue()) {
                        nps_filter.setValue({eq: field.getValue()});
                        nps_filter.setActive(true);
                    } else {
                        nps_filter.setActive(false);
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
                }
            },

            'inventaire_form #type_vin_dd': {
                select: function(field, records, eopts) {
                    if (records.length == 0) { return; }
                    var form = field.up('#inventaire_f');
                    form.getForm().loadRecord(records[0]);
                }
            },

            'inventaire_form #save_inv_record_btn': {
                click: function(btn) {
                    var form = btn.up('inventaire_form').down('#inventaire_f');
                    var noi = form.down('#no_inventaire_tf').getValue();
                    var is_new_inv_rec = (noi === null || noi === '');
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

                                // update no_inv, price fields, etc.
                                form.loadRecord(action.result);

                                var cb = function(records, operation, success) {
                                    // reset selection state before load
                                    if (operation && selected_ni) {
                                        var r = g.getStore().query('no_inventaire', selected_ni);
                                        g.getSelectionModel().select(r.items);
                                    }
                                };

                                // really not sure of this..
                                if (is_new_inv_rec) {
                                    btn.up('inventaire_form').down('#inventaire_g').getStore().load({
                                        callback: cb
                                    });
                                } else {
                                    btn.up('inventaire_form').down('#inventaire_g').getStore().reload({
                                        callback: cb
                                    });
                                }
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
        if (current_user.representant_id) {
            invf.down('#editor_pnl').collapse();
        } else {
            invf.down('#editor_pnl').expand();
        }
    }

});
