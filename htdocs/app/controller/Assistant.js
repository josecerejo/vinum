Ext.define('VIN.controller.Assistant', {

    extend: 'Ext.app.Controller',

    init: function() {

        this.control({

            '#assistant_dd': {
                select: function(field, records, opts) {
                    var r = records[0].raw;
                    if (r.target === 'client' && r.hasOwnProperty('id')) {
                        var client_rec = Ext.create('VIN.model.Client', {'no_client': r['id']});
                        VIN.app.getController('Client').createClientForm(client_rec);
                    }
                    if (r.target === 'commande' && r.hasOwnProperty('filter')) {
                        var cg = VIN.app.getController('Commande').createCommandeGrid();
                        var filter = cg.filters.getFilter('no_client');
                        filter.setValue({eq: r.filter.no_client});
                        filter.setActive(true);
                    }
                    if (r.target === 'inventaire' && r.hasOwnProperty('filter')) {
                        var ig = VIN.app.getController('Inventaire').createInventaireForm().down('#inventaire_g');
                        var filter = ig.filters.getFilter('type_vin');
                        filter.setValue(r.filter.type_vin);
                        // must apply filter twice (bug):
                        // http://stackoverflow.com/questions/9629531/apply-grid-filter-programmatically-from-function
                        filter = ig.filters.getFilter('type_vin');
                        filter.setValue(r.filter.type_vin);
                        filter.setActive(true);
                    }
                    if (r.target === 'backorder' && r.hasOwnProperty('filter')) {
                        var bog = VIN.app.getController('Backorder').createBOTab().down('#backorder_g');
                        var k = Object.keys(r.filter)[0];
                        var filter = bog.filters.getFilter(k);
                        filter.setValue({eq: r.filter[k]});
                        filter.setActive(true);
                    }
                }
            }

        });
    }

});
