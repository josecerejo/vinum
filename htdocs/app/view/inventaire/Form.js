Ext.define('VIN.view.inventaire.Form', {

    extend: 'Ext.form.Panel',
    alias: 'widget.inventaire_form',
    title: 'Inventaire',
    closable: true,
    layout: 'border',

    initComponent: function() {

        this.items = [{
            region: 'west',
            layout: 'fit',
            border: false,
            flex: 0.75,
            items: Ext.create('VIN.view.inventaire.Grid', {
                store: Ext.create('VIN.store.Inventaires'),
                column_flex: {
                    type_vin: 3,
                    millesime: 1,
                    format: 1,
                    prix_restaurant: 1.5,
                    prix_particulier: 1.5,
                    prix_coutant: 1.5,
                    solde_caisse: 1,
                    solde_bouteille: 1,
                    no_produit_saq: 1.5,
                    no_demande_saq: 1.5,
                    quantite_commandee: 1.5,
                    quantite_recue: 1.5,
                    date_commande: 2,
                    date_recue: 2,
                    statut_inventaire: 1.5,
                    quantite_par_caisse: 1,
                    age_in_days: 1
                }
            })
        }, {
            region: 'center',
            width: 0,
            flex: 0
        }, {
            region: 'east',
            flex: 0.25,
            xtype: 'panel',
            layout: 'fit',
            collapsible: true,
            items: {}
        }];

        this.callParent(arguments);
    }

});