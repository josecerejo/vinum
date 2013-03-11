Ext.define('VIN.store.CommandeItems', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.CommandeItem',
    groupField: 'type_vin',
    proxy: {
        type: 'ajax',
        url: ajax_url_prefix + '/commande/get_items',
        reader: {
            type: 'json',
            root: 'rows'
        }
    }

});