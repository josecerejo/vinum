Ext.define('VinumMobile.view.client.List', {
    extend: 'Ext.dataview.List',
    alias: 'widget.client_list',
    config: {
        store: 'Clients',
        onItemDisclosure: true,
        disableSelection: true,
        plugins: [{
            xclass: 'Ext.plugin.ListPaging',
            autoPaging: true
        }],
        itemTpl: '{nom_social}'
    }
});
