Ext.define('VIN.model.Inventaire', {

    extend: 'Ext.data.Model',

    fields: [{
        header: '# inventaire', // to be used with VIN.utils.getGridColumnsFromModel
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
    },  {
        header: 'Millésime',
        name: 'millesime',
        type: 'int',
        useNull: true
    }, {
        header: 'Format',
        name: 'format'
    }, {
        header: 'Prix (resto)',
        name: 'prix_restaurant',
        type: 'float',
        useNull: true
    }, {
        header: 'Prix (particulier)',
        name: 'prix_particulier',
        type: 'float',
        useNull: true
    }, {
        header: 'Prix coûtant',
        name: 'prix_coutant',
        type: 'float',
        useNull: true
    }, {
        header: 'Solde (c)', // computed on the fly (i.e. not in the model)
        name: 'solde_caisse',
        type: 'int',
        useNull: true
    }, {
        header: 'Solde (b)',
        name: 'solde_bouteille',
        type: 'int',
        useNull: true
    }, {
        header: 'Qté reçue',
        name: 'quantite_recue',
        type: 'int',
        useNull: true
    }, {
        header: '# produit SAQ',
        name: 'no_produit_saq',
        type: 'int',
        useNull: true
    }, {
        header: '# commande SAQ',
        name: 'no_commande_saq'
        // this is not an int!
    }, {
        header: 'Qté commandée',
        name: 'quantite_commandee',
        type: 'int',
        useNull: true
    }, {
        header: 'Date de commande',
        name: 'date_commande',
        type: 'date'
    }, {
        header: 'Date reçue',
        name: 'date_recue',
        type: 'date'
    }, {
        header: 'Statut',
        name: 'statut',
        filter: {
            type: 'list',
            options: ['actif', 'en réserve', 'en attente', 'inactif'],
            value: ['actif', 'en réserve', 'en attente'],
            active: true
        }
    }, {
        header: 'Qté par caisse',
        name: 'quantite_par_caisse',
        type: 'int',
        useNull: true
    }, {
        header: 'Commission',
        name: 'commission',
        type: 'float',
        useNull: true
    }, {
        header: 'Solde 30 jours',
        name: 'solde_30_jours',
        type: 'float',
        useNull: true
    }, {
        header: 'Solde 60 jours',
        name: 'solde_60_jours',
        type: 'float',
        useNull: true
    }, {
        header: 'SucNum',
        name: 'suc_num',
        type: 'int',
        useNull: true
    }, {
        header: 'Âge (en jours)',
        name: 'age_in_days',
        type: 'int',
        useNull: true,
        filterable: false
    }],

    idProperty: 'no_inventaire'

});
