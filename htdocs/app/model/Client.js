Ext.define('VIN.model.Client', {

    extend: 'Ext.data.Model',

    fields: [{
        header: '# client',
        name: 'no_client',
        type: 'int',
        useNull: true
    }, {
        header: '# SAQ',
        name: 'no_client_saq',
        type: 'int',
        useNull: true
    }, {
        header: 'Nom social',
        name: 'nom_social'
    }, {
        header: '# civique',
        name: 'no_civique',
        type: 'string', // could be an integer
    }, {
        name: 'rue',
    }, {
        name: 'ville',
    }, {
        name: 'province',
    }, {
        header: 'Code postal',
        name: 'code_postal',
    }, {
        header: 'Nom du responsable',
        name: 'nom_responsable',
    }, {
        header: '# téléphone',
        name: 'no_tel',
    }, {
        header: '# fax',
        name: 'no_fax',
    }, {
        header: '# téléphone personnel',
        name: 'no_tel_personnel',
    }, {
        header: '# portable',
        name: 'no_cellulaire',
    }, {
        name: 'courriel',
    }, {
        header: 'Type de client',
        name: 'type_client',
    }, {
        header: 'Spécialité',
        name: 'specialite',
    }, {
        header: 'Représentant',
        name: 'representant',
    }, {
        header: 'Expédition',
        name: 'expedition',
    }, {
        header: '# succursale',
        name: 'no_succursale',
    }, {
        header: 'Facturation',
        name: 'mode_facturation'
    }, {
        header: 'Facturation (note)',
        name: 'mode_facturation_note'
    }, {
        header: 'Note',
        name: 'note_client'
    }, {
        header: 'Ouverture du dossier',
        name: 'date_ouverture_dossier',
        type: 'date'
    }],

    idProperty: 'no_client'

});
