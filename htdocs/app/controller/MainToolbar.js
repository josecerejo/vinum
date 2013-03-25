Ext.define('VIN.controller.MainToolbar', {

    extend: 'Ext.app.Controller',
    views: ['VIN.view.MainToolbar'],

    init: function() {

        var about = [Ext.String.format('<b>Vinum</b> (version <i>{0}</i>)', vinum_version),
                     '',
                     'Créé par <a href="http://christianjauv.in" target="_blank">Christian Jauvin</a>',
                     'pour la <a href="http://roucet.com" target="_blank">Société Roucet</a>, en 2012-2013.',
                     '',
                     Ext.String.format('Dernière mise à jour : <a href="https://github.com/cjauvin/vinum/commits/master" target="_blank">{0}</a>', last_update),
                     'Code source : <a href="https://github.com/cjauvin/vinum" target="_blank">https://github.com/cjauvin/vinum</a>'];

        this.control({
            'toolbar menuitem': {
                click: function(itm, e, opts) {
                    switch (itm.id) {
                    case 'logout_menu_itm':
                        Ext.Ajax.request({
                            url: ajax_url_prefix + '/logout',
                            method: 'POST',
                            success: function() {
                                login_win.pop();
                            }
                        });
                        break;
                    case 'vinum_about_menu_itm':
                        Ext.Msg.show({
                            title: 'Vinum',
                            msg: about.join('<br />'),
                            icon: Ext.MessageBox.INFO,
                            buttons: Ext.MessageBox.OK
                        });
                        break;
                    case 'create_commande_menu_itm':
                        VIN.app.getController('Commande').createCommandeForm();
                        break;
                    case 'edit_client_menu_itm':
                        VIN.app.getController('Client').createClientForm();
                        break;
                    case 'list_clients_menu_itm':
                        VIN.app.getController('Client').createClientGrid();
                        break;
                    case 'list_commandes_menu_itm':
                        VIN.app.getController('Commande').createCommandeGrid();
                        break;
                    case 'produits_pp_menu_itm':
                        VIN.app.getController('ProduitEtProducteur').createForm();
                        break;
                    case 'produits_inv_menu_itm':
                        VIN.app.getController('Inventaire').createInventaireForm();
                        break;
                    case 'bo_list_menu_itm':
                        VIN.app.getController('Backorder').createBOGrid();
                        break;
                    case 'bo_create_menu_itm':
                        VIN.app.getController('Backorder').popNewBOWindow();
                        break;
                    case 'rapport_transaction_menu_itm':
                        VIN.app.getController('Rapport').createRapportTransactionGrid();
                        break;
                    case 'rapport_vente_menu_itm':
                        VIN.app.getController('Rapport').createRapportVenteGrid();
                        break;
                    };
                }
            }
        });
    },

    onLaunch: function() {
        if (initial_tab && window.location.hostname == 'localhost') {
            var t = Ext.create(initial_tab);
            if (t.xtype.match(/_grid$/)) {
                t.getStore().load();
            }
            Ext.getCmp('main_pnl').add(t);
            Ext.getCmp('main_pnl').setActiveTab(t);
        }
    }

});
