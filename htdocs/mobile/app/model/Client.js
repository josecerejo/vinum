Ext.define('VinumMobile.model.Client', {
    extend: 'Ext.data.Model',
    config: {
        fields: ['no_client',
                 'nom_social',
                 'courriel',
                 'no_tel',
                 'note_client']
    }
});
