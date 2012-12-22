Ext.define('VIN.store.Inventaires', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Inventaire',
    pageSize: 100,
    buffered: true,
    remoteSort: true,
    sorters: [{
        property: 'type_vin',
        direction: 'ASC'
    }],
    proxy: {
        type: 'ajax',
        url: ajax_url_prefix + '/inventaire/get',
        reader: {
            type: 'json',
            root: 'rows'
        }
    }

});
