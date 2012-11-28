Ext.define('VIN.controller.Client', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.client.Form'],
    models: ['VIN.model.Client'],
    stores: ['VIN.store.Clients'],

    init: function() {

        this.control({

            '#client_combo': {
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

            '#save_btn': {
                click: function(btn) {
                    var f = this._getFormViewInstance(btn);
                    f.submit({
                        url: ajax_url_prefix + '/client/save',
                        success: function(form, action) {
                        }
                    });
                }
            }

        });
    },

    _getFormViewInstance: function(any_contained_view) {
        return any_contained_view.up('client_form');
    }

});
