Ext.define('VIN.store.Commandes', {
    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Commande',
    //pageSize: 50,
    //buffered: true,
    //autoLoad: true,
    //remoteSort: true,
    // sorters: [{
    //     property: 'type_vin',
    //     direction: 'ASC'
    // }],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'rows'
        }
    }    
});
