Ext.define('VinumMobile.controller.AppController', {
    extend: 'Ext.app.Controller',
    requires: ['VinumMobile.view.client.Panel', 'VinumMobile.view.client.List', 'VinumMobile.view.client.Form'],
    config: {
        control: {
            'mainview #top_nav_list': {
                itemtap: function(view, idx, item, rec) {
                    view.deselect(idx);
                    if (rec.get('title') !== 'Clients') {
                        Ext.Msg.alert("Non disponible!");
                    } else {
                        Ext.getCmp('mainview').push({
                            xtype: 'client_panel',
                            title: 'Clients'
                        });
                        Ext.getStore('Clients').load();
                    }
                }
            },
            'client_panel client_list': {
                itemtap: function(view, idx, item, rec) {
                    var cf = Ext.create('VinumMobile.view.client.Form');
                    Ext.getCmp('mainview').push(cf);
                    Ext.Ajax.request({
                        url: ajax_url_prefix + '/client/load',
                        params: {
                            no_client: rec.get('no_client')
                        },
                        success: function(response) {
                            var client_rec = Ext.create('VinumMobile.model.Client',
                                                        Ext.JSON.decode(response.responseText).data);
                            cf.setRecord(client_rec);
                        }
                    });
                }
            },
            'client_panel #client_sf': {
                keyup: function(field) {
                    Ext.getStore('Clients').load({
                        params: {
                            query: field.getValue()
                        }
                    });
                },
                clearicontap: function() {
                    Ext.getStore('Clients').load();
                }
            }
        }
    },
});
