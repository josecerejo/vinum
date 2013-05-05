Ext.define('VinumMobile.view.client.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.client_form',
    config: {
        url: ajax_url_prefix + '/client/load',
        items: [{
            xtype: 'fieldset',
            title: 'Client',
            items: [{
                xtype: 'textfield',
                name: 'nom_social',
                label: 'Nom',
                useClearIcon: false,
                readOnly: true
            }, {
                xtype: 'textfield',
                name: 'courriel',
                label: 'Courriel',
                useClearIcon: false,
                readOnly: true
            }, {
                xtype: 'textfield',
                name: 'no_tel',
                label: 'Téléphone',
                useClearIcon: false,
                readOnly: true
            }, {
                xtype: 'textareafield',
                maxRows: 8,
                name: 'note_client',
                label: 'Notes',
                useClearIcon: false,
                readOnly: true
            }]
        }]
    }
});
