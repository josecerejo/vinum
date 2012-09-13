Ext.define('VIN.view.commande.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.commande_form',
    frame: true,
    autoScroll: true,
    title: 'Commande',

    initComponent: function() {
        var client_store = Ext.create('VIN.store.Clients');
        this.items = [{
            xtype: 'combo',
            displayField: 'nom_social',
            store: client_store,
            itemId: 'client_combo',
            fieldLabel: 'Nom du client',
            minChars: 3,
            width: 500,
            listConfig: {
                loadingText: 'Searching...',
                emptyText: 'Aucun client ne correspond à cette recherche..',            
                getInnerTpl: function() {
                    return '<span style="display:inline-block; width:300px !important">{nom_social}</span>{no_client_saq}';
                }
            },
            pageSize: 10
        }, {
            xtype: 'datefield',
            fieldLabel: 'Date',
            format: 'Y-m-d',
            value: new Date()
        }];
        this.callParent(arguments);
    }

});
