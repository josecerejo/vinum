Ext.define('VIN.model.Producteur', {

    extend: 'Ext.data.Model',

    fields: [{
        header: '# producteur',
        name: 'no_producteur',
        type: 'int',
        useNull: true
    }, {
        header: 'ancien # producteur',
        name: 'ancien_no_producteur',
        type: 'int',
        useNull: true
    }, {
        header: 'Nom',
        name: 'nom_producteur'
    }, {
        header: 'Nom du responsable',
        name: 'nom_responsable'
    }, {
        name: 'no_civique'
    }, {
        name: 'rue',
    }, {
        name: 'ville'
    }, {
        header: 'Comté',
        name: 'comte'
    }, {
        header: 'Code postal',
        name: 'code_postal'
    }, {
        header: 'Région',
        name: 'region'
    }, {
        name: 'pays'
    }, {
        header: '# téléphone',
        name: 'no_tel',
    }, {
        header: '# fax',
        name: 'no_fax',
    }, {
        name: 'courriel'
    }, {
        name: 'suc_num',
        type: 'int',
        useNull: true
    }],

    idProperty: 'no_producteur'

});
