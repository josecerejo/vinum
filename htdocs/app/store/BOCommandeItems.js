Ext.define('VIN.store.BOCommandeItems', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.CommandeItem',
    pageSize: 100,
    buffered: true,
    remoteSort: true,
    sorters: [{
        property: 'date_commande',
        direction: 'DESC'
    }, {
        property: 'type_vin',
        direction: 'ASC'
    }],
    proxy: {
        type: 'ajax',
        url: ajax_url_prefix + '/commande/get_bos',
        reader: {
            type: 'json',
            root: 'rows'
        }
    }

});
