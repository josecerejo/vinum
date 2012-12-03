Ext.define('VIN.model.Commande', {

    extend: 'Ext.data.Model',

    fields: [{
        header: '# facture',
        name: 'no_commande_facture', 
        type: 'int'
    }, {
        header: 'Ancien # facture',
        name: 'ancien_no_commande_facture', 
        type: 'int'
    }, {
        header: '# client',
        type: 'int',
        name: 'no_client'
    }, {
        header: 'Date de la commande',
        name: 'date_commande',
        type: 'date'
    }, {            
        header: 'Expédition',
        name: 'expedition'
    }, {
        header: 'Succursale',
        name: 'no_succursale'
    }, {
        header: 'Date de pickup',
        name: 'date_pickup',
        type: 'date'
    }, {
        header: 'Date d\'exp. directe',
        name: 'date_direct',
        type: 'date'
    }, {
        header: 'Date d\'envoi',
        name: 'date_envoi',
        type: 'date'
    }, {
        header: 'Statut (commande)',
        name: 'statut_commande'
    }, {
        name: 'sous-total',
        type: 'float'
    }, {
        name: 'montant',
        type: 'float'
    }, {
        header: 'TPS',
        name: 'tps',
        type: 'float'
    }, {
        header: 'TVQ',
        name: 'tvq',
        type: 'float'
    }, {
        header: 'Statut (facture)',
        name: 'statut_facture'
    }, {
        header: 'Jour de livraison',
        name: 'jour_livraison'
    }],

    idProperty: 'no_commande_facture'

});
