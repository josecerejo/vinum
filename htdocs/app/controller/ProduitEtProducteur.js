Ext.define('VIN.controller.ProduitEtProducteur', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.ProduitEtProducteurForm'],
    models: ['VIN.model.Produit', 'VIN.model.Producteur'],
    stores: ['VIN.store.Produits', 'VIN.store.Producteurs'],

    init: function() {

        this.control({

            'pp_forms #produit_g': {
                selectionchange: function(model, records) {
                    if (records.length == 0) { return; }
                    var form = this._getFormViewInstance(model.view).down('#pp_produit_form');
                    form.down('#nom_producteur_dd').forceSelection = false;
                    form.load({
                        url: ajax_url_prefix + '/produit/load',
                        params: {
                            no_produit_interne: records[0].get('no_produit_interne')
                        },
                        success: Ext.bind(function(_form, action) {
                            // this hack is required to load a full producteur model in the dd,
                            // to allow form.load to retrieve its no_producteur field later
                            var r = Ext.create('VIN.model.Producteur', action.result.data);
                            form.down('#nom_producteur_dd').getStore().loadRecords([r]);
                            form.down('#nom_producteur_dd').forceSelection = true;
                        }, this)
                    });
                }
            },
            'pp_forms #producteur_g': {
                selectionchange: function(model, records) {
                    if (records.length == 0) { return; }
                    var form = this._getFormViewInstance(model.view).down('#pp_producteur_form');
                    form.load({
                        url: ajax_url_prefix + '/producteur/load',
                        params: {
                            no_producteur: records[0].get('no_producteur')
                        },
                        callback: Ext.bind(function(records, operation, success) {
                        }, this)
                    });
                }
            },
            'pp_forms #filter_produits_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var no_producteur = form.down('#no_producteur_tf').getValue();
                    if (no_producteur) {
                        var filter = form.down('#produit_g').filters.getFilter('no_producteur');
                        filter.setValue({eq: no_producteur});
                        filter.setActive(true);
                    } else {
                        Ext.Msg.show({
                            title: 'Vinum',
                            msg: Ext.String.format("Veuillez tout d'abord sélectionner un producteur dans la table de gauche"),
                            icon: Ext.MessageBox.INFO,
                            buttons: Ext.MessageBox.OK
                        });
                    }
                }
            },
            'pp_forms #all_produits_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var filter = form.down('#produit_g').filters.getFilter('no_producteur');
                    filter.setActive(false);
                }
            },
            'pp_forms #new_produit_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    form.down('#pp_produit_form').getForm().reset();
                }
            },
            'pp_forms #new_producteur_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    form.down('#pp_producteur_form').getForm().reset();
                }
            },
            'pp_forms #save_produit_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var pf = form.down('#pp_produit_form');
                    if (pf.getForm().isValid()) {
                        var pdd = pf.down('#nom_producteur_dd');
                        var pr = pdd.findRecordByDisplay(pdd.getValue());
                        pf.submit({
                            url: ajax_url_prefix + '/produit/save',
                            params: {
                                no_producteur: pr.get('no_producteur')
                            },
                            success: Ext.bind(function(_form, action) {
                                Ext.Msg.show({
                                    title: 'Vinum',
                                    msg: Ext.String.format("Le produit '{0}' a été {1}", pf.down('#type_vin_tf').getValue(),
                                                           pf.down('#no_produit_interne_tf').getValue() ? 'modifié' : 'créé'),
                                    icon: Ext.MessageBox.INFO,
                                    buttons: Ext.MessageBox.OK
                                });
                                pf.loadRecord(action.result); // to load no_produit_interne_tf
                                form.down('#produit_g').getStore().reload();
                            }, this)
                        });
                    }
                }
            },
            'pp_forms #produit_g actioncolumn': {
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit \'{0}\' de la base de données',
                                                               rec.get('type_vin')),
                        Ext.bind(function(btn) {
                            if (btn == 'yes') {
                                Ext.Ajax.request({
                                    url: ajax_url_prefix + '/produit/delete',
                                    params: {
                                        no_produit_interne: rec.get('no_produit_interne')
                                    },
                                    success: function(response) {
                                        grid.store.reload();
                                    }
                                });
                            }
                        }, this));
                }
            }
        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('pp_forms');
    },

    createForm: function() {
        var ppf = Ext.create('widget.pp_forms');
        Ext.getCmp('main_pnl').add(ppf);
        Ext.getCmp('main_pnl').setActiveTab(ppf);
    }

});
