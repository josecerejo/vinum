Ext.define('VIN.store.Inventaires', {
    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Inventaire',
    pageSize: 50,
    //buffered: true,
    //autoLoad: true,
    remoteSort: true,
    // sorters: [{
    //     property: 'type_vin',
    //     direction: 'ASC'
    // }],
    proxy: {
        type: 'ajax',
        url: '/vinum_server/inventaire/get',
        reader: {
            type: 'json',
            root: 'rows'
        },
        listeners: {
            exception: function (thisProxy, responseObj, operation, eventOpts) {
                VIN.utils.serverErrorPopup(Ext.JSON.decode(responseObj.responseText).error_msg);
            }
        }
    }    
});
    
