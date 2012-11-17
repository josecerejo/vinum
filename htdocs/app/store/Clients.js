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
        url: ajax_url_prefix + '/client/get',
        reader: {
            type: 'json',
            root: 'rows'
        }
        // listeners: {
        //     exception: function (thisProxy, responseObj, operation, eventOpts) {
        //         var div = document.createElement('div');
        //         div.id = 'flask_debug_console_div';
        //         //div.innerHTML = responseObj.responseText;
        //         document.body.appendChild(div);
        //         Ext.create('Ext.window.Window', {
        //             title: 'Flask Debug Console',
        //             height: 400,
        //             width: 800,
        //             layout: 'fit',
        //             contentEl: div.id,
        //             autoScroll: true
        //         }).show();
        //         //Ext.get(win.contentEl).innerHTML = responseObj.responseText;
        //         $(div).html(responseObj.responseText);
        //         //Ext.get(div.id).setHTML(responseObj.responseText);
        //         //Ext.get(div.id).insertHtml('afterEnd', responseObj.responseText);
        //         //VIN.utils.serverErrorPopup(Ext.JSON.decode(responseObj.responseText).error_msg);
        //     }
        // }
    }    
});
    
