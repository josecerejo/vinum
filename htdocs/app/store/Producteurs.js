Ext.define('VIN.store.Producteurs', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Producteur',
    pageSize: 100,
    buffered: true,
    remoteSort: true,
    sorters: [{
        property: 'nom_producteur',
        direction: 'ASC'
    }],
    proxy: {
        type: 'ajax',
        url: ajax_url_prefix + '/producteur/get',
        reader: {
            type: 'json',
            root: 'rows'
        }
    }

});
