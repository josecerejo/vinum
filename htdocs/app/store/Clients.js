Ext.define('VIN.store.Clients', {
    extend: 'Ext.data.Store',
    requires: ['VIN.utils'],
    model: 'VIN.model.Client',
    pageSize: 50,
    //buffered: true,
    //autoLoad: true,
    remoteSort: true,
    sorters: [{
        property: 'nom_social',
        direction: 'ASC'
    }],
    proxy: {
        type: 'ajax',
        url: '/vinum_server/client/get',
        //url: 'http://localhost:5000/client/get',
        reader: {
            type: 'json',
            root: 'rows'
        },
        listeners: {
            exception: function (thisProxy, responseObj, operation, eventOpts) {
                //console.log(responseObj.responseText);
                //var win = window.open('', '_self');
                //win.document.write(responseObj.responseText);
                // Ext.Msg.show({
                //     title: 'Erreur du serveur', 
                //     msg: responseObj.responseText,
                //     icon: Ext.MessageBox.ERROR,
                //     buttons: Ext.MessageBox.OK
                // });                        
                VIN.utils.serverErrorPopup(Ext.JSON.decode(responseObj.responseText).error_msg);
            }
        }
    }    
});
    
