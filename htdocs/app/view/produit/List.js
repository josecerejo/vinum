Ext.define('VIN.view.produit.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.produit_grid',
    title: 'Produits',
    requires: ['Ext.ux.grid.FiltersFeature'],

    initComponent: function() {
        this.store = Ext.create('VIN.store.Produits');
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
        header: '# produit', 
        dataIndex: 'no_produit_interne', 
        type: 'int',
        filterable: true
    }, {
        header: '# produit (ancien)', 
        dataIndex: 'ancien_no_produit', 
        type: 'int',
        filterable: true
    }, {
        header: 'Nom du producteur', 
        dataIndex: 'nom_producteur', 
        flex: 1,
        filterable: true
    }, {
        header: 'Type de vin', 
        dataIndex: 'type_vin', 
        filterable: true,
        hidden: true
    }, {
        header: 'Nom du domaine', 
        dataIndex: 'nom_domaine',
        filterable: true,
        hidden: true
    }, {
        header: 'Format', 
        dataIndex: 'format',
        filterable: true,
        hidden: true        
    }, {
        header: 'Couleur', 
        dataIndex: 'couleur',
        filterable: true,
        hidden: true
    }, {
        header: 'Quantité par caisse', 
        dataIndex: 'quantite_par_caisse',
        type: 'int',
        filterable: true,
        hidden: true
    }, {
        header: 'Pays', 
        dataIndex: 'pays',
        filterable: true,
        hidden: true
    }, {
        header: '# succursale', 
        dataIndex: 'suc_num',
        type: 'int',
        filterable: true,
        hidden: true
    }]

});
