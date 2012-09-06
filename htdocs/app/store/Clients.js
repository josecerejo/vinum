Ext.define('VIN.store.Clients', {
    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Client',
    pageSize: 200,
    //buffered: true,
    autoLoad: true,
    remoteSort: true,
    sorters: [{
        property: 'nom_social',// 'no_client',
        direction: 'DESC'
    }],
    proxy: {
        type: 'ajax',
        url: '/vinum_server/client/get',
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
    
