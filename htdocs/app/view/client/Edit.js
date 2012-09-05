Ext.define('VIN.view.client.Edit', {
    extend: 'Ext.form.Panel',
    alias: 'widget.client_form',
    frame: true,
    url: '/vinum_server/client/update',
    items: [{
        xtype: 'fieldset',
        title: "Détails",
        items: [{
            xtype: 'textfield',
            fieldLabel: '# client',
            name: 'no_client'
        }, {
            xtype: 'textfield',
            fieldLabel: '# SAQ',
            name: 'no_client_saq'
        }, {
            xtype: 'textfield',
            fieldLabel: 'Nom social',
            name: 'nom_social'
        }, {
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
    }]
});
