Ext.define('VIN.view.client.Form', {

    extend: 'Ext.form.Panel',
    alias: 'widget.client_form',
    autoScroll: true,
    title: 'Client',
    closable: true,
    fieldDefaults: {
        labelAlign: 'top'
    },

    initComponent: function() {

        // stores
        var client_search_store = Ext.create('VIN.store.Clients');

        this.items = {
            bodyStyle: 'background-color:#dfe8f5',
            border: false,
            defaults: {
                bodyStyle: 'background-color:#dfe8f5',
                border: false,
                padding: 10,
                flex: .5
            },
            layout: 'hbox',
            items: [{
                // -----------------------------------------------------
                // left part panel
                layout: 'anchor',
                items: [{
                    layout: 'hbox',
                    bodyStyle: 'background-color:#dfe8f5',
                    border: false,
                    items: [{
                        // client combo
                        xtype: 'combo',
                        //anchor: '100%',
                        flex: 0.8,
                        displayField: 'nom_social',
                        name: 'nom_social',
                        store: client_search_store,
                        itemId: 'client_combo',
                        fieldLabel: 'Client',
                        minChars: 3,
                        forceSelection: false, // important if we want to allow client creation
                        listConfig: {
                            loadingText: 'Recherche...',
                            emptyText: 'Aucun client ne correspond à cette recherche..',
                            getInnerTpl: function() {
                                return '<span style="display:inline-block; width:80% !important">{nom_social}</span>' +
                                       '<span style="display:inline-block; width:20% !important">{no_client_saq}</span>';
                            }
                        },
                        pageSize: 10,
                        style: 'margin-bottom: 20px; margin-right: 20px'
                    }, {
                        flex: 0.2,
                        xtype: 'datefield',
                        fieldLabel: "Date d'ouverture du dossier",
                        name: 'date_commande',
                        format: 'Y-m-d',
                        value: new Date()
                    }],
                }]
            }, {
                // -----------------------------------------------------
                // right part panel
                layout: 'anchor',
                items: [{
                }]
            }]
        };

        this.callParent(arguments);
    }

});
