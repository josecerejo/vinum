Ext.define('VIN.model.Client', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'no_client', 
        type: 'int',
        useNull: true
    }, {
        name: 'no_client_saq', 
        type: 'int',
        useNull: true
    }, {
        name: 'nom_social'
    }, {
        name: 'no_civique',
        type: 'string', // could be an integer
    }, {
        name: 'rue',
    }, {
        name: 'ville',
    }, {
        name: 'province',
    }, {
        name: 'code_postal',
    }, {
        name: 'nom_responsable',
    }, {
        name: 'no_tel',
    }, {
        name: 'no_fax',
    }, {
        name: 'no_tel_personnel',
    }, {
        name: 'no_cellulaire',
    }, {
        name: 'courriel',
    }, {
        name: 'type_client',
    }, /* {
        name: 'specialite',
    }, {
        name: 'representant',
    }, {
        name: 'expedition',
    }, {
        name: 'no_succursale',
    }, {
        name: 'note',
    }, */ {
        name: 'date_ouverture_dossier',
        type: 'date'
    }],
    idProperty: 'no_client'
});
