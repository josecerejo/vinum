Ext.define('VIN.model.Inventaire', {

    extend: 'Ext.data.Model',

    fields: [{
        header: '# inventaire', // to be used with VIN.utils.getGridColumnsFromModel
        name: 'no_inventaire',
        type: 'int'
    }, {
        header: '# produit interne',
        name: 'no_produit_interne',
        type: 'int'
    }, {
        header: 'Type de vin',
        name: 'type_vin'
    }, {
        header: 'Format',
        name: 'format'
    }, {
        header: 'Qté par caisse',
        name: 'quantite_par_caisse',
        type: 'int',
    }, {
        header: '# produit SAQ',
        name: 'no_produit_saq',
        type: 'int'
    }, {
        header: '# commande SAQ',
        name: 'no_commande_saq'
    }, {
        header: 'Qté commandée',
        name: 'quantite_commandee',
        type: 'int'
    }, {
        header: 'Qté reçue',
        name: 'quantite_recue',
        type: 'int'
    }, {
        header: 'Date de commande',
        name: 'date_commande',
        type: 'date'
    }, {
        header: 'Date reçue',
        name: 'date_recue',
        type: 'date'
    }, {
        header: 'Prix coûtant',
        name: 'prix_coutant',
        type: 'float'
    }, {
        header: 'Millésime',
        name: 'millesime',
        type: 'int'
    }, {
        header: 'Commission',
        name: 'commission',
        type: 'float'
    }, {
        header: 'Solde (c)', // computed on the fly (i.e. not in the model)
        name: 'solde_caisse',
        type: 'int'
    }, {
        header: 'Solde (b)',
        name: 'solde_bouteille',
        type: 'int'
    }, {
        header: 'Solde 30 jours',
        name: 'solde_30_jours',
        type: 'float'
    }, {
        header: 'Solde 60 jours',
        name: 'solde_60_jours',
        type: 'float'
    }, {
        header: 'Statut',
        name: 'statut',
        filter: {
            type: 'list',
            options: ['actif', 'en réserve', 'en attente', 'inactif']
        }
    }, {
        header: 'SucNum',
        name: 'suc_num',
        type: 'int'
    }],

    idProperty: 'no_inventaire'

});
