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
        header: 'Qté par caisse',
        name: 'quantite_par_caisse',
        type: 'int',
        useNull: true
    }, {
        name: 'pays'
    }, {
        name: 'suc_num',
        type: 'int',
        useNull: true
    }, { // those two are actually part of a Commande, but since
         // they can displayed in a product table, they must be here too
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
        header: 'No producteur',
        name: 'no_producteur',
        type: 'int',
        useNull: true
    }, {
        header: 'Nom du producteur',
        name: 'nom_producteur'
    }],

    idProperty: 'no_produit_interne'

});
