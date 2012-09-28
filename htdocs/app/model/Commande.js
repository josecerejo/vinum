Ext.define('VIN.model.Commande', {
    extend: 'Ext.data.Model',
    fields: [{
        header: '# inventaire',
        name: 'no_inventaire', 
        type: 'int',
        useNull: true
    }, {
        header: '# produit interne',
        name: 'no_produit_interne', 
        type: 'int',
        useNull: true
    }, {
        header: 'Type de vin',
        name: 'type_vin'
    }, {
        header: 'Format',
        name: 'format'
    }, {            
        header: '# produit SAQ',
        name: 'no_produit_saq',
        type: 'int',
        useNull: true
    }, {
        header: '# commande SAQ',
        name: 'no_commande_saq'
    }, {
        header: 'Quantité (c)',
        name: 'quantite_caisse',
        type: 'int',
        useNull: true
    }, {
        header: 'Quantité (b)',
        name: 'quantite_bouteille',
        type: 'int',
        useNull: true
    }, {
        header: 'Commission',
        name: 'commission',
        type: 'float',
        useNull: true
    }, {
        header: 'Statut',
        name: 'statut'
    }],
    idProperty: 'no_produit_saq'
});
