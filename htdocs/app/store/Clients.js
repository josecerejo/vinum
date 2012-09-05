Ext.define('VIN.store.Clients', {
    extend: 'Ext.data.Store',
    model: 'VIN.model.Client',
    pageSize: 200,
    buffered: true,
    autoLoad: true,
    remoteSort: true,
    sorters: [{
        property: 'no_client',
        direction: 'ASC'
    }],
    proxy: {
        type: 'ajax',
        url: '/vinum_server/client/get',
        reader: {
            type: 'json',
            root: 'rows'
        }
    }    
});
    
