Ext.define('VIN.controller.Client', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.client.Form'],
    models: ['VIN.model.Client'],
    stores: ['VIN.store.Clients'],

    init: function() {

        this.control({

            'client_form #client_combo': {
                select: function(field, records, eopts) {
                    var f = this._getFormViewInstance(field);
                    f.load({
                        url: ajax_url_prefix + '/client/load',
                        params: {
                            no_client: records[0].get('no_client')
                        }
                    });
                }
            },

            'client_form #save_btn': {
                click: function(btn) {
                    var f = this._getFormViewInstance(btn);
                    if (f.getForm().isValid()) {
                        f.submit({
                            url: ajax_url_prefix + '/client/save',
                            success: function(form, action) {
                                var no_client = action.result.no_client;
                                Ext.Msg.show({
                                    title: 'Vinum',
                                    msg: Ext.String.format("Le client #{0} a été {1}", no_client, 
                                                           f.down('#no_client_tf').getValue() ? 'modifié' : 'créé'),
                                    icon: Ext.MessageBox.WARNING,
                                    buttons: Ext.MessageBox.OK
                                });                                            
                                f.down('#no_client_tf').setValue(no_client);
                            }
                        });
                    }
                }
            },

            'client_form #succ_combo': {
                focus: function(field) {
                    var view = this._getFormViewInstance(field);
                    view.down('#succ_rb').setValue(true);
                }
            },

            'client_form #copy_addr_btn': {
                click: function(btn) {
                    var f = this._getFormViewInstance(btn);
                    Ext.Array.forEach(['no_civique', 'rue', 'ville', 'province', 'code_postal'], function(item) {
                        var src = f.down(Ext.String.format('#{0}_tf', item));
                        var dst = f.down(Ext.String.format('#{0}_fact_tf', item));
                        dst.setValue(src.getValue());
                    });
                }
            },

            'client_grid actioncolumn': {
                del_click: function(grid, el, rowIndex, colIndex, e, rec, rowEl) {
                    Ext.Msg.confirm('Vinum', Ext.String.format('Êtes-vous certain de vouloir enlever le client #{0} de la base de données', 
                                                               rec.get('no_client')), 
                        Ext.bind(function(btn) {
                            if (btn == 'yes') {
                                Ext.Ajax.request({
                                    url: ajax_url_prefix + '/client/delete',
                                    params: {
                                        no_client: rec.get('no_client')
                                    },
                                    success: function(response) {
                                        grid.store.reload();
                                    }
                                });
                            }
                        }, this));
                },
                edit_click: function(grid, el, rowIndex, colIndex, e, record, rowEl) {
                    this.openForm(record);
                }
            },

            'client_grid': {
                itemdblclick: function(view, record, item, index, e, eOpts) {
                    this.openForm(record);
                }
            }

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('client_form');
    },

    openForm: function(client_rec) {
        var cf = Ext.create('widget.client_form');
        var mp = Ext.getCmp('main_pnl');
        mp.add(cf);
        mp.setActiveTab(cf);
        cf.load({
            url: ajax_url_prefix + '/client/load',
            params: {
                no_client: client_rec.get('no_client')
            }
        });        
    }

});
