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
            }

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('client_form');
    }

});
