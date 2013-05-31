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
                    this.loadProduitForm(form, records[0]);
                }
            },
            'pp_forms #pp_produit_f #type_vin_dd': {
                select: function(field, records, eopts) {
                    var form = this._getFormViewInstance(field).down('#pp_produit_f');
                    this.loadProduitForm(form, records[0]);
                }
            },
            'pp_forms #producteur_g': {
                selectionchange: function(model, records) {
                    if (records.length == 0) { return; }
                    var form = this._getFormViewInstance(model.view).down('#pp_producteur_f');
                    this.loadProducteurForm(form, records[0]);
                }
            },
            'pp_forms #pp_producteur_f #nom_producteur_dd': {
                select: function(field, records, eopts) {
                    var form = this._getFormViewInstance(field).down('#pp_producteur_f');
                    this.loadProducteurForm(form, records[0]);
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
                                no_producteur: pr.get('no_producteur'),
                                est_actif: form.down('#est_actif_cb').getValue(),
                                est_en_dispo_reduite: form.down('#est_en_dispo_reduite_cb').getValue()
                            },
                            success: Ext.bind(function(_form, action) {
                                Ext.Msg.show({
                                    title: 'Vinum',
                                    msg: Ext.String.format("Le produit '{0}' a été {1}", pf.down('#type_vin_dd').getValue(),
                                                           pf.down('#no_produit_interne_tf').getValue() ? 'modifié' : 'créé'),
                                    icon: Ext.MessageBox.INFO,
                                    buttons: Ext.MessageBox.OK
                                });
                                pf.down('#no_produit_interne_tf').setValue(action.result.data.no_produit_interne);
                                form.down('#produit_g').getStore().reload();
                            }, this)
                        });
                    }
                }
            },
            'pp_forms #new_produit_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    form.down('#pp_produit_f').getForm().reset();
                    form.down('#produit_g').getSelectionModel().deselectAll();
                }
            },
            'pp_forms #del_produit_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var pf = form.down('#pp_produit_f');
                    if (!pf.down('#no_produit_interne_tf').getValue()) { return; }
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le produit \'{0}\' de la base de données?',
                                                               pf.down('#type_vin_dd').getValue()),
                        Ext.bind(function(btn) {
                            if (btn == 'yes') {
                                pf.submit({
                                    url: ajax_url_prefix + '/produit/delete',
                                    success: function(response) {
                                        form.down('#produit_g').getStore().reload();
                                        pf.getForm().reset();
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
                                    msg: Ext.String.format("Le producteur '{0}' a été {1}", pf.down('#nom_producteur_dd').getValue(),
                                                           pf.down('#no_producteur_tf').getValue() ? 'modifié' : 'créé'),
                                    icon: Ext.MessageBox.INFO,
                                    buttons: Ext.MessageBox.OK
                                });
                                //pf.loadRecord(action.result); // to load no_producteur_tf
                                pf.down('#no_producteur_tf').setValue(action.result.data.no_producteur);
                                form.down('#producteur_g').getStore().reload();
                            }, this)
                        });
                    }
                }
            },
            'pp_forms #new_producteur_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    form.down('#pp_producteur_f').getForm().reset();
                    form.down('#producteur_g').getSelectionModel().deselectAll();
                }
            },
            'pp_forms #del_producteur_btn': {
                click: function(btn) {
                    var form = this._getFormViewInstance(btn);
                    var pf = form.down('#pp_producteur_f');
                    if (!pf.down('#no_producteur_tf').getValue()) { return; }
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le producteur \'{0}\' de la base de données?',
                                                               pf.down('#nom_producteur_dd').getValue()),
                        Ext.bind(function(btn) {
                            if (btn == 'yes') {
                                pf.submit({
                                    url: ajax_url_prefix + '/producteur/delete',
                                    success: function(response) {
                                        form.down('#producteur_g').getStore().reload();
                                        pf.getForm().reset();
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
    },

    loadProduitForm: function(form, rec) {
        form.down('#nom_producteur_dd').forceSelection = false;
        form.down('#format_dd').forceSelection = false;
        form.getForm().loadRecord(rec);
        // this is required to load a full producteur model in the dd,
        // to allow form.load to retrieve its no_producteur field later
        form.down('#nom_producteur_dd').getStore().loadRecords([rec]);
        // -------------------------------------------------------------------
        form.down('#nom_producteur_dd').forceSelection = true;
        form.down('#format_dd').forceSelection = true;
    },

    loadProducteurForm: function(form, rec) {
        form.down('#region_dd').forceSelection = false;
        form.down('#pays_dd').forceSelection = false;
        form.getForm().loadRecord(rec);
        form.down('#pays_dd').forceSelection = true;
        form.down('#region_dd').forceSelection = true;
    }

});
