Ext.define('VIN.model.Client', {

    extend: 'Ext.data.Model',

    fields: [{
        header: '# client',
        name: 'no_client',
        type: 'int',
        useNull: true
    }, {
        header: 'Nom social',
        name: 'nom_social'
    }, {
        header: '# SAQ',
        name: 'no_client_saq',
        type: 'int',
        useNull: true
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
        header: '# mobile',
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
        name: 'representant_nom',
    }, {
        header: 'Expédition',
        name: 'expedition',
    }, {
        header: '# succ. SAQ',
        name: 'no_succursale_saq',
    }, {
        header: 'Facturation',
        name: 'mode_facturation'
    }, {
        header: 'Jours de livraison',
        name: 'jours_livraison',
        filterable: false
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
    }, {
        header: 'Actif',
        name: 'est_actif',
        type: 'bool',
        filter: {
            active: true,
            value: true
        }
    }, {
        header: 'Problème de comptabilité',
        name: 'a_probleme_comptabilite',
        type: 'bool'
    }],

    idProperty: 'no_client'

});
