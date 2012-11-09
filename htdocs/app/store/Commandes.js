Ext.define('VIN.store.Commandes', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Commande',
    //pageSize: 50,
    //buffered: true,
    //autoLoad: false,
    //remoteSort: true,
    // sorters: [{
    //     property: 'type_vin',
    //     direction: 'ASC'
    // }],
    groupField: 'type_vin',
    proxy: {
        type: 'memory',
        // url: '/vinum_server/commande/save_items',
        // extraParams: {
        //     no_facture: -1
        // },
        reader: {
            type: 'json',
            root: 'rows'
        }
        // writer: {
        //     type: 'json',
        //     root: 'rows',
        //     encode: true,
        //     allowSingle: true
        // }
    }    
});
