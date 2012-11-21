Ext.define('VIN.store.Clients', {
    extend: 'Ext.data.Store',
    model: 'VIN.model.Client',
    pageSize: 50,
    //buffered: true,
    //autoLoad: true,
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
            root: 'rows'
        }
    }    
});
    
