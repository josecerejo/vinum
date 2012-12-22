Ext.define('VIN.view.inventaire.Form', {

    extend: 'Ext.form.Panel',
    alias: 'widget.inventaire_form',
    requires: ['VIN.view.inventaire.Grid'],
    autoScroll: true,
    title: 'Inventaire',
    closable: true,
    frame: true,
    url: ajax_url_prefix + '/inventaire/get',
    fieldDefaults: {
        labelAlign: 'top'
    },

    initComponent: function() {

        // this.dockedItems = {
        //     xtype: 'toolbar',
        //     dock: 'top',
        //     items: [{
        //         text: 'Sauvegarder',
        //         itemId: 'save_btn',
        //         iconCls: 'disk-icon'
        //     }, {
        //         text: 'Créer une commande pour ce client',
        //         itemId: 'create_commande_btn',
        //         iconCls: 'commandes-add-icon'
        //     }]
        // };

        // this.items = {
        //     bodyStyle: 'background-color:#dfe8f5',
        //     border: false,
        //     defaults: {
        //         bodyStyle: 'background-color:#dfe8f5',
        //         border: false,
        //         padding: 10,
        //         flex: .5
        //     },

        this.items = [{
            xtype: 'inventaire_grid',
            itemId: 'inventaire_g',
            is_master_grid: true,
            //title: 'Commandes faites par ce client',
            resizable: { handles: 's' },
            store: Ext.create('VIN.store.Inventaires'),
            column_flex: 'all'
        }];

        this.callParent(arguments);
    }

});
