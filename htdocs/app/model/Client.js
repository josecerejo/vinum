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
        name: 'nom_social',
        type: 'string'
    }, {
        name: 'date_ouverture_dossier',
        type: 'date'
    }],
    idProperty: 'no_client'
});
