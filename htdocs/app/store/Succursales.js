Ext.define('VIN.store.Succursales', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Succursale',
    pageSize: 1000, // make sure to get them all
    remoteSort: true,
    sorters: [{
        property: 'no_succursale_saq',
        direction: 'ASC'
    }],
    proxy: {
        type: 'ajax',
        url: ajax_url_prefix + '/succursale/get',
        reader: {
            type: 'json',
            root: 'rows'
        }
    }

});
