Ext.define('VIN.store.Backorders', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Backorder',
    pageSize: 100,
    buffered: true,
    remoteSort: true,
    sorters: [{
        property: 'date_bo',
        direction: 'DESC'
    }, {
        property: 'type_vin',
        direction: 'ASC'
    }],
    proxy: {
        type: 'ajax',
        url: ajax_url_prefix + '/backorder/get',
        reader: {
            type: 'json',
            root: 'rows'
        }
    }

});
