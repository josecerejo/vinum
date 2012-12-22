Ext.define('VIN.store.Commandes', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Commande',
    pageSize: 100,
    buffered: true,
    remoteSort: true,
    sorters: [{
        property: 'date_commande',
        direction: 'DESC'
    }, {
        property: 'no_commande_facture',
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
