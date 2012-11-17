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
        reader: {
            type: 'json',
            root: 'rows'
        }
    }    
});
