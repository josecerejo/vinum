Ext.define('VIN.store.CommandeItems', {

    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.CommandeItem',
    groupField: 'type_vin',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'rows'
        }
    }    

});
