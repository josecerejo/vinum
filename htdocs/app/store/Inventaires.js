Ext.define('VIN.store.Inventaires', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Inventaire',
    pageSize: 50,
    remoteSort: true,
    sorters: [{
        property: 'date_commande',
        direction: 'desc'
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
