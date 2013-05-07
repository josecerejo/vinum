Ext.define('VIN.model.CommandeItem', {

    extend: 'Ext.data.Model',

    fields: [{
        name: 'commande_item_id',
        type: 'int',
        useNull: true
    }, {
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
        name: 'format'
    }, {
        header: 'Producteur',
        name: 'nom_producteur'
    },{
        header: '# produit SAQ',
        name: 'no_produit_saq',
        type: 'int',
        useNull: true
    }, {
        header: '# demande SAQ', // not an int!
        name: 'no_demande_saq'
    }, {
        header: 'Qté. (c)',
        name: 'quantite_caisse',
        type: 'int',
        useNull: true
    }, {
        header: 'Qté. (b)',
        name: 'quantite_bouteille',
        type: 'int',
        useNull: true
    }, {
        header: 'Prix coûtant',
        name: 'prix_coutant',
        type: 'float',
        useNull: true
    }, {
        header: 'Comm. (%)',
        name: 'commission',
        type: 'float',
        useNull: true
    }, {
        header: 'Comm. ($)',
        name: 'montant_commission',
        type: 'float',
        useNull: true
    }, {
        header: 'Statut',
        name: 'statut_item'
    }]

    //idProperty: 'no_produit_saq'

});
