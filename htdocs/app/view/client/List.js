Ext.define('VIN.view.client.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.client_grid',
    title: 'Clients',
    closable: true,
    //store: 'VIN.store.Clients',
    requires: ['Ext.ux.grid.FiltersFeature'],

    initComponent: function() {
        this.store = Ext.create('VIN.store.Clients');
        this.dockedItems = {
            xtype: 'pagingtoolbar',
            store: this.store,
            dock: 'bottom',
            displayInfo: true
        };
        this.callParent(arguments);
    },

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
        header: 'No. civique', 
        dataIndex: 'no_civique', 
        filterable: true,
        hidden: true
    }, {
        header: 'Rue', 
        dataIndex: 'rue',
        filterable: true,
        hidden: true
    }, {
        header: 'Ville', 
        dataIndex: 'ville',
        filterable: true,
        hidden: true        
    }, {
        header: 'Province', 
        dataIndex: 'province',
        filterable: true,
        hidden: true
    }, {
        header: 'Code postal', 
        dataIndex: 'code_postal',
        filterable: true,
        hidden: true
    }, {
        header: 'Nom du responsable', 
        dataIndex: 'nom_responsable',
        filterable: true,
        hidden: true
    }, {
        header: 'No. téléphone', 
        dataIndex: 'no_tel',
        filterable: true,
        hidden: true
    }, {
        header: 'No. fax', 
        dataIndex: 'no_fax',
        filterable: true,
        hidden: true
    }, {
        header: 'No. téléphone personnel', 
        dataIndex: 'no_tel_personnel',
        filterable: true,
        hidden: true
    }, {
        header: 'No. portable', 
        dataIndex: 'no_cellulaire',
        filterable: true,
        hidden: true
    }, {
        header: 'Courriel', 
        dataIndex: 'courriel',
        filterable: true,
        hidden: true
    }, {
        header: 'Type de client', 
        dataIndex: 'type_client',
        filterable: true,
        hidden: true
    }, /* {
        header: 'Spécialité', 
        dataIndex: 'specialite',
        filterable: true,
        hidden: true
    }, {
        header: 'Représentant', 
        dataIndex: 'representant',
        filterable: true,
        hidden: true
    }, {
        header: 'Expédition', 
        dataIndex: 'expedition',
        filterable: true,
        hidden: true
    }, {
        header: 'No. succursale', 
        dataIndex: 'no_succursale',
        filterable: true,
        hidden: true
    }, {
        header: 'Note', 
        dataIndex: 'note',
        filterable: true,
        hidden: true
    }, */ {
        header: 'Ouverture du dossier',
        width: 150,
        dataIndex: 'date_ouverture_dossier',
        filterable: true,
        renderer: Ext.util.Format.dateRenderer('Y-m-d')
    }],
    // dockedItems: {
    //     xtype: 'pagingtoolbar',
    //     store: //'VIN.store.Clients',
    //     dock: 'bottom',
    //     displayInfo: true
    // }
});
