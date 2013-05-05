Ext.define('VinumMobile.store.Clients', {
    extend: 'Ext.data.Store',
    config: {
        model: 'VinumMobile.model.Client',
        remoteSort: true,
        sorters: [{
            property: 'nom_social',
            direction: 'ASC'
        }],
        proxy: {
            type: 'ajax',
            url: ajax_url_prefix + '/client/get',
            reader: {
                type: 'json',
                totalProperty: 'total',
                rootProperty: 'rows'
            },
        }
    }
});
