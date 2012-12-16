Ext.define('VIN.model.Commande', {

    extend: 'Ext.data.Model',

    fields: [{
        header: '# commande',
        name: 'no_commande_facture',
        type: 'int',
        useNull: true
    }, {
        header: 'Ancien # commande',
        name: 'ancien_no_commande_facture',
        type: 'int',
        useNull: true
    }, {
        header: '# client',
        type: 'int',
        name: 'no_client',
        useNull: true
    }, {
        header: '# client SAQ',
        type: 'int',
        name: 'no_client_saq',
        useNull: true
    }, {
        header: 'Nom social',
        name: 'nom_social'
    }, {
        header: 'Date de la commande',
        name: 'date_commande',
        type: 'date'
    }, {
        header: 'Expédition',
        name: 'expedition'
    }, {
        header: 'Succursale',
        name: 'no_succursale',
        type: 'int',
        useNull: true
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
        name: 'montant',
        type: 'float',
        useNull: true
    }, {
        header: 'Statut (commande)',
        name: 'statut_commande'
    }, {
        name: 'sous-total',
        type: 'float',
        useNull: true
    }, {
        header: 'TPS',
        name: 'tps',
        type: 'float',
        useNull: true
    }, {
        header: 'TVQ',
        name: 'tvq',
        type: 'float',
        useNull: true
    }, {
        header: 'Statut (facture)',
        name: 'statut_facture'
    }, {
        header: 'Jour de livraison',
        name: 'jour_livraison'
    }, {
        header: 'Facture envoyée',
        name: 'facture_est_envoyee',
        type: 'bool'
    }, {
        header: 'BDC envoyé',
        name: 'bon_de_commande_est_envoye',
        type: 'bool'
    }],

    idProperty: 'no_commande_facture'

});
