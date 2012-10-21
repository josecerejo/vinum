Ext.define('VIN.model.Produit', {
    extend: 'Ext.data.Model',
    fields: [{
        header: '# produit interne',
        name: 'no_produit_interne', 
        type: 'int',
        useNull: true
    }, {
        header: 'ancien # produit',
        name: 'ancien_no_produit', 
        type: 'int',
        useNull: true
    }, {             
        header: 'Nom du producteur',
        name: 'nom_producteur'
    }, {
        header: 'Type de vin',
        name: 'type_vin'
    }, {
        header: 'Nom du domaine',
        name: 'nom_domaine'
    }, {
        name: 'format',
    }, {
        name: 'couleur'
    }, {
        header: 'Quantité (c)',
        name: 'quantite_par_caisse',
        type: 'int'
    }, {
        name: 'pays'
    }, {
        name: 'suc_num',
        type: 'int',
        useNull: true
    }],
    idProperty: 'no_produit_interne'
});
