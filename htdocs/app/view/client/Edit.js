Ext.define('VIN.view.client.Edit', {
    extend: 'Ext.form.Panel',
    alias: 'widget.client_form_',
    frame: true,
    url: '/vinum_server/client/update',
    autoScroll: true,
    items: [{
        xtype: 'fieldset',
        title: "Détails",
        defaults: {
            xtype: 'textfield'
        },
        items: [{
            fieldLabel: '# client',
            name: 'no_client',
            id: 'no_client_tf'
        }, {
            fieldLabel: '# SAQ',
            name: 'no_client_saq'
        }, {
            fieldLabel: 'Nom social',
            name: 'nom_social'
        }, {
            fieldLabel: 'Numéro civique',
            name: 'no_civique'            
        }, {
            fieldLabel: 'Rue', 
            name: 'rue'
        }, {
            fieldLabel: 'Ville', 
            name: 'ville'
        }, {
            fieldLabel: 'Province', 
            name: 'province'
        }, {
            fieldLabel: 'Code postal', 
            name: 'code_postal'
        }, {
            fieldLabel: 'Nom du responsable', 
            name: 'nom_responsable'
        }, {
            fieldLabel: 'No. téléphone', 
            name: 'no_tel'
        }, {
            fieldLabel: 'No. fax', 
            name: 'no_fax'
        }, {
            fieldLabel: 'No. téléphone personnel', 
            name: 'no_tel_personnel'
        }, {
            fieldLabel: 'No. portable', 
            name: 'no_cellulaire'
        }, {
            fieldLabel: 'Courriel', 
            name: 'courriel'
        }, {
            fieldLabel: 'Type de client', 
            name: 'type_client'
        }, /* {
            fieldLabel: 'Spécialité', 
            name: 'specialite'
        }, {
            fieldLabel: 'Représentant', 
            name: 'representant'
        }, {
            fieldLabel: 'Expédition', 
            name: 'expedition'
        }, {
            fieldLabel: 'No. succursale', 
            name: 'no_succursale'
        }, {
            fieldLabel: 'Note', 
            name: 'note'
        }, */ {
            xtype: 'datefield',
            fieldLabel: 'Ouverture du dossier',
            name: 'date_ouverture_dossier',
            format: 'Y-m-d'
        }],
    }],
    buttons: [{
        text: 'Créer'
    }, {
        text: 'Modifier'
    }, {
        text: 'Détruire'
    }]
});
