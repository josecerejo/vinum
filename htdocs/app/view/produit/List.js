Ext.define('VIN.view.produit.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.produit_grid',
    requires: ['Ext.ux.grid.FiltersFeature'],
    column_flex: {
    },

    initComponent: function() {
        
        this.store = Ext.create('VIN.store.Produits');

        this.dockedItems = {
            xtype: 'pagingtoolbar',
            store: this.store,
            dock: 'bottom',
            displayInfo: true
        };

        this.columns = [{
            header: '# produit', 
            dataIndex: 'no_produit_interne', 
            type: 'int',
            filterable: true,
            flex: this.column_flex.hasOwnProperty('ancien_no_produit') ? this.column_flex.ancien_no_produit : 0,
            hidden: !this.column_flex.hasOwnProperty('no_produit_interne')
        }, {
            header: '# produit (ancien)', 
            dataIndex: 'ancien_no_produit', 
            type: 'int',
            filterable: true,
            flex: this.column_flex.hasOwnProperty('ancien_no_produit') ? this.column_flex.ancien_no_produit : 0,
            hidden: !this.column_flex.hasOwnProperty('ancien_no_produit')
        }, {
            header: 'Nom du producteur', 
            dataIndex: 'nom_producteur', 
            filterable: true,
            flex: this.column_flex.hasOwnProperty('nom_producteur') ? this.column_flex.nom_producteur : 0,
            hidden: !this.column_flex.hasOwnProperty('nom_producteur')
        }, {
            header: 'Type de vin', 
            dataIndex: 'type_vin', 
            filterable: true,
            flex: this.column_flex.hasOwnProperty('type_vin') ? this.column_flex.type_vin : 0,
            hidden: !this.column_flex.hasOwnProperty('type_vin')
        }, {
            header: 'Nom du domaine', 
            dataIndex: 'nom_domaine',
            filterable: true,
            flex: this.column_flex.hasOwnProperty('nom_domaine') ? this.column_flex.nom_domaine : 0,
            hidden: !this.column_flex.hasOwnProperty('nom_domaine')
        }, {
            header: 'Format', 
            dataIndex: 'format',
            filterable: true,
            flex: this.column_flex.hasOwnProperty('format') ? this.column_flex.format : 0,
            hidden: !this.column_flex.hasOwnProperty('format')
        }, {
            header: 'Couleur', 
            dataIndex: 'couleur',
            filterable: true,
            flex: this.column_flex.hasOwnProperty('couleur') ? this.column_flex.couleur : 0,
            hidden: !this.column_flex.hasOwnProperty('couleur')
        }, {
            header: 'Quantité par caisse', 
            dataIndex: 'quantite_par_caisse',
            type: 'int',
            filterable: true,
            flex: this.column_flex.hasOwnProperty('quantite_par_caisse') ? this.column_flex.quantite_par_caisse : 0,
            hidden: !this.column_flex.hasOwnProperty('quantite_par_caisse')
        }, {
            header: 'Pays', 
            dataIndex: 'pays',
            filterable: true,
            flex: this.column_flex.hasOwnProperty('pays') ? this.column_flex.pays : 0,
            hidden: !this.column_flex.hasOwnProperty('pays')
        }, {
            header: '# succursale', 
            dataIndex: 'suc_num',
            type: 'int',
            filterable: true,
            flex: this.column_flex.hasOwnProperty('suc_num') ? this.column_flex.suc_num : 0,
            hidden: !this.column_flex.hasOwnProperty('suc_num')
        }];
        this.callParent(arguments);
    },

    viewConfig: {
        preserveScrollOnRefresh: true
    },
    features: [{
        ftype: 'filters',
        encode: true,
        local: false
    }]

});
