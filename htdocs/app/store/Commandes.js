Ext.define('VIN.store.Commandes', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Commande',
    pageSize: 50,
    sorters: [{
        property: 'date_commande',
        direction: 'DESC'
    }],
    proxy: {
        type: 'ajax',
        url: ajax_url_prefix + '/commande/get',
        reader: {
            type: 'json',
            root: 'rows'
        }
    }

});
