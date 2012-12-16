Ext.define('VIN.model.CommandeItem', {

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
        name: 'statut'
    }],

    idProperty: 'no_produit_saq'

});
