Ext.define('VIN.view.client.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.client_grid',
    store: 'VIN.store.Clients',
    requires: ['Ext.ux.grid.FiltersFeature'],
    viewConfig: {
        preserveScrollOnRefresh: true
    },
    features: [{
        ftype: 'filters',
        encode: true,
        local: false
    }], 
    columns: [{
        header: '# client', 
        dataIndex: 'no_client', 
        type: 'int',
        filterable: true
    }, {
        header: '# SAQ', 
        dataIndex: 'no_client_saq', 
        type: 'int',
        filterable: true
    }, {
        header: 'Nom social', 
        dataIndex: 'nom_social', 
        flex: 1,
        filterable: true
    }, {
        header: 'Ouverture du dossier',
        width: 150,
        dataIndex: 'date_ouverture_dossier',
        filterable: true,
        renderer: Ext.util.Format.dateRenderer('Y-m-d')
    }],
    dockedItems: {
        xtype: 'pagingtoolbar',
        store: 'VIN.store.Clients',
        dock: 'bottom',
        displayInfo: true
    }
});
