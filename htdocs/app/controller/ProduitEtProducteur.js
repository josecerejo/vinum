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
                    var form = this._getFormViewInstance(model.view).down('#pp_produit_f');
                    form.down('#nom_producteur_dd').forceSelection = false;
                    form.getForm().loadRecord(records[0]);
                    // this hack is required to load a full producteur model in the dd,
                    // to allow form.load to retrieve its no_producteur field later
                    form.down('#nom_producteur_dd').getStore().loadRecords([records[0]]);
                    form.down('#nom_producteur_dd').forceSelection = true;
                }
            },
            'pp_forms #producteur_g': {
                selectionchange: function(model, records) {
                    if (records.length == 0) { return; }
                    var form = this._getFormViewInstance(model.view).down('#pp_producteur_f');
                    form.getForm().loadRecord(records[0]);
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
                    form.down('#pp_produit_f').getForm().reset();
                }
            },
            'pp_forms #new_producteur_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    form.down('#pp_producteur_f').getForm().reset();
                }
            },
            'pp_forms #save_produit_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var pf = form.down('#pp_produit_f');
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
                                form.down('#produit_g').getStore().load();
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
                                        grid.getStore().load();
                                    }
                                });
                            }
                        }, this));
                }
            },
            'pp_forms #save_producteur_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var pf = form.down('#pp_producteur_f');
                    if (pf.getForm().isValid()) {
                        pf.submit({
                            url: ajax_url_prefix + '/producteur/save',
                            success: Ext.bind(function(_form, action) {
                                Ext.Msg.show({
                                    title: 'Vinum',
                                    msg: Ext.String.format("Le producteur '{0}' a été {1}", pf.down('#nom_producteur_tf').getValue(),
                                                           pf.down('#no_producteur_tf').getValue() ? 'modifié' : 'créé'),
                                    icon: Ext.MessageBox.INFO,
                                    buttons: Ext.MessageBox.OK
                                });
                                pf.loadRecord(action.result); // to load no_producteur_tf
                                form.down('#producteur_g').getStore().load();
                            }, this)
                        });
                    }
                }
            },
            'pp_forms #producteur_g actioncolumn': {
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le producteur \'{0}\' de la base de données',
                                                               rec.get('nom_producteur')),
                        Ext.bind(function(btn) {
                            if (btn == 'yes') {
                                Ext.Ajax.request({
                                    url: ajax_url_prefix + '/producteur/delete',
                                    params: {
                                        no_producteur: rec.get('no_producteur')
                                    },
                                    success: function(response) {
                                        grid.store.load();
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
        var ppf = Ext.getCmp('main_pnl').down('pp_forms');
        if (!ppf) {
            ppf = Ext.create('widget.pp_forms');
            Ext.getCmp('main_pnl').add(ppf);
        }
        Ext.getCmp('main_pnl').setActiveTab(ppf);
    }

});
