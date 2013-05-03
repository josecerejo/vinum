Ext.define('VIN.controller.Visu', {

    extend: 'Ext.app.Controller',

    init: function() {

        this.control({
        })

    },

    createVentesChart: function() {
        var c = Ext.getCmp('main_pnl').down('#ventes_chart_pnl');
        if (!c) {

            var store1 = Ext.create('Ext.data.JsonStore', {
                fields: ['x', 'y'],
                proxy: {
                    type: 'ajax',
                    url: ajax_url_prefix + '/visu/ventes',
                    reader: {
                        type: 'json',
                        root: 'data'
                    }
                }
            });
            store1.load();

            cp =  Ext.create('widget.panel', {
                layout: 'fit',
                itemId: 'ventes_chart_pnl',
                title: "Chiffre d'affaires annuel",
                closable: true,
                // tbar: [{
                //     text: 'Save Chart',
                //     handler: function(){ downloadChart(chart2); }
                // }],
                items: {
                    xtype: 'chart',
                    animate: false,
                    store: store1,
                    insetPadding: 30,
                    axes: [{
                    type: 'Numeric',
                    minimum: 0,
                    position: 'left',
                    fields: ['y'],
                    title: false,
                    grid: true,
                    label: {
                        renderer: Ext.util.Format.numberRenderer('0,0'),
                        font: '10px Arial'
                    }
                    }, {
                        type: 'Category',
                        position: 'bottom',
                        fields: ['x'],
                        title: false
                        // label: {
                        //     font: '11px Arial',
                        //     renderer: function(x) {
                        //         return name.substr(0, 3);
                        //     }
                        // }
                    }],
                    series: [{
                        type: 'line',
                        axis: 'left',
                            xField: 'x',
                        yField: 'y',
                        tips: {
                            trackMouse: true,
                            width: 140,
                            height: 25,
                            renderer: function(storeItem, item) {
                                this.setTitle(Ext.String.format('{0}$ en {1}', storeItem.get('y'), storeItem.get('x')));
                            }
                        },
                        style: {
                            fill: '#38B8BF',
                            stroke: '#38B8BF',
                            'stroke-width': 3
                        },
                        markerConfig: {
                            type: 'circle',
                            size: 4,
                            radius: 4,
                            'stroke-width': 0,
                            fill: '#38B8BF',
                            stroke: '#38B8BF'
                        }
                    }]
                }
            });
            Ext.getCmp('main_pnl').add(cp);
        }
        Ext.getCmp('main_pnl').setActiveTab(cp);
    }

});
