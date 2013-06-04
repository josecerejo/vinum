Ext.define('VIN.controller.Assistant', {

    extend: 'Ext.app.Controller',

    init: function() {

        this.control({

            '#assistant_dd': {
                select: function(field, records, opts) {
                    var r = records[0].raw;
                    if (r.target === 'client' && r.action === 'edit') {
                        var client_rec = Ext.create('VIN.model.Client', {'no_client': r.no_client});
                        VIN.app.getController('Client').createClientForm(client_rec);
                    }
                    if (r.target === 'commande' && r.action === 'filter') {
                        var cg = VIN.app.getController('Commande').createCommandeGrid();
                        var filter = cg.filters.getFilter('no_client');
                        filter.setValue({eq: r.no_client});
                        filter.setActive(true);
                    }
                    if (r.target === 'commande' && r.action === 'create') {
                        VIN.app.getController('Commande').createCommandeForm(r.no_client);
                    }
                    if (r.target === 'inventaire' && r.action === 'filter') {
                        var ig = VIN.app.getController('Inventaire').createInventaireForm().down('#inventaire_g');
                        var filter = ig.filters.getFilter('type_vin');
                        filter.setValue(r.type_vin);
                        // must apply filter twice (bug):
                        // http://stackoverflow.com/questions/9629531/apply-grid-filter-programmatically-from-function
                        filter = ig.filters.getFilter('type_vin');
                        filter.setValue(r.type_vin);
                        filter.setActive(true);
                    }
                    if (r.target === 'backorder' && r.action === 'filter') {
                        var bog = VIN.app.getController('Backorder').createBOTab().down('#backorder_g');
                        var f = r.hasOwnProperty('no_client') ? 'no_client' : 'no_produit_interne';
                        var filter = bog.filters.getFilter(f);
                        filter.setValue({eq: r[f]});
                        filter.setActive(true);
                    }
                    if (r.target === 'prix' && r.action === 'filter') {
                        var pg = VIN.app.getController('Prix').createPrixTab().down('#prix_g');
                        var filter = pg.filters.getFilter('type_vin');
                        filter.setValue(r.type_vin);
                        // must apply filter twice (bug):
                        // http://stackoverflow.com/questions/9629531/apply-grid-filter-programmatically-from-function
                        filter = pg.filters.getFilter('type_vin');
                        filter.setValue(r.type_vin);
                        filter.setActive(true);
                    }
                }
            }

        });
    }

});
