Ext.define('VIN.model.Succursale', {

    extend: 'Ext.data.Model',

    fields: [{
        header: 'No succursale',
        name: 'no_succursale_saq',
        type: 'int',
        useNull: true,
        editor: {
            xtype: 'numberfield'
        }
    }, {
        name: 'adresse',
        editor: {
            xtype: 'textfield'
        }
    }, {
        name: 'ville',
        editor: {
            xtype: 'textfield'
        }
    }]

});
