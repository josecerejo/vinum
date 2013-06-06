Ext.define('VIN.controller.Assistant', {

    extend: 'Ext.app.Controller',

    init: function() {

        this.control({

            '#assistant_dd': {
                select: function(field, records, opts) {
                    var r = records[0].raw;
                    if (r.target === 'client') {
                        switch (r.action) {
                        case 'edit':
                            var client_rec = Ext.create('VIN.model.Client', {'no_client': r.no_client});
                            VIN.app.getController('Client').createFormTab(client_rec);
                            break;
                        case 'create':
                            VIN.app.getController('Client').createFormTab();
                            break;
                        case 'all':
                            VIN.app.getController('Client').createGridTab();
                            break;
                        }
                    } else if (r.target === 'commande') {
                        switch (r.action) {
                        case 'create':
                            VIN.app.getController('Commande').createFormTab(r.no_client);
                            break;
                        case 'filter':
                            var cg = VIN.app.getController('Commande').createGridTab();
                            var filter = cg.filters.getFilter('no_client');
                            filter.setValue({eq: r.no_client});
                            filter.setActive(true);
                            break;
                        case 'all':
                            VIN.app.getController('Commande').createGridTab();
                            break;
                        }
                    } else if (r.target === 'inventaire') {
                        switch (r.action) {
                        case 'filter':
                            var ig = VIN.app.getController('Inventaire').createTab().down('#inventaire_g');
                            var filter = ig.filters.getFilter('type_vin');
                            filter.setValue(r.type_vin);
                            // must apply filter twice (bug):
                            // http://stackoverflow.com/questions/9629531/apply-grid-filter-programmatically-from-function
                            filter = ig.filters.getFilter('type_vin');
                            filter.setValue(r.type_vin);
                            filter.setActive(true);
                            break;
                        case 'all':
                            VIN.app.getController('Inventaire').createTab();
                            break;
                        }
                    } else if (r.target === 'backorder') {
                        switch (r.action) {
                        case 'filter':
                            var bog = VIN.app.getController('Backorder').createTab().down('#backorder_g');
                            var f = r.hasOwnProperty('no_client') ? 'no_client' : 'no_produit_interne';
                            var filter = bog.filters.getFilter(f);
                            filter.setValue({eq: r[f]});
                            filter.setActive(true);
                            break;
                        case 'all':
                            VIN.app.getController('Backorder').createBOTab();
                            break;
                        }
                    } else if (r.target === 'prix') {
                        switch (r.action) {
                        case 'filter':
                            var pg = VIN.app.getController('Prix').createTab().down('#prix_g');
                            var filter = pg.filters.getFilter('type_vin');
                            filter.setValue(r.type_vin);
                            // must apply filter twice (bug):
                            // http://stackoverflow.com/questions/9629531/apply-grid-filter-programmatically-from-function
                            filter = pg.filters.getFilter('type_vin');
                            filter.setValue(r.type_vin);
                            filter.setActive(true);
                            break;
                        case 'all':
                            VIN.app.getController('Prix').createTab();
                            break;
                        }
                    }
                }
            }

        });
    }

});
