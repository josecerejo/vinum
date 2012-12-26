Ext.define('VIN.store.Produits', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Produit',
    pageSize: 100,
    buffered: true,
    remoteSort: true,
    sorters: [{
        property: 'type_vin',
        direction: 'ASC'
    }],
    proxy: {
        type: 'ajax',
        url: ajax_url_prefix + '/produit/get',
        reader: {
            type: 'json',
            root: 'rows'
        }
    }

});
