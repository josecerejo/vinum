Ext.define('VIN.model.Backorder', {

    extend: 'Ext.data.Model',

    fields: [{
        name: 'backorder_id',
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
        header: 'Nom social',
        name: 'nom_social'
    }, {
        header: 'Date',
        name: 'date_bo',
        type: 'date'
    }, {
        header: 'Représentant',
        name: 'representant_nom'
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
    }]

});
