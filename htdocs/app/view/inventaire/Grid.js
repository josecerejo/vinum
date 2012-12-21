Ext.define('VIN.view.inventaire.Grid', {

    extend: 'Ext.grid.Panel',
    alias: 'widget.inventaire_grid',
    requires: ['Ext.ux.grid.FiltersFeature'],
    title: 'Inventaire',
    closable: true,
    column_flex: 'all',
    use_paging_toolbar: true,
    use_colors: true,

    initComponent: function() {

        if (!this.store) {
            this.store = Ext.create('VIN.store.Inventaires');
        }

        this.columns = VIN.utils.getGridColumnsFromModel(this.store.getProxy().getModel(), this.column_flex);

        this.dockedItems = [{
            xtype: 'toolbar',
            dock: 'top',
            items: [{
                text: 'Colorer en fonction de l\'âge',
                enableToggle: true,
                itemId: 'show_colors_btn',
                iconCls: 'color-icon',
                pressed: true
            }]
        }];

        if (this.use_paging_toolbar) {
            this.dockedItems.push({
                xtype: 'pagingtoolbar',
                dock: 'bottom',
                store: this.store,
                displayInfo: true
            });
        }

        this.viewConfig = {
            getRowClass: Ext.bind(function(record, index, rowParams, store) {
                var a = parseInt(record.get('age_in_days'));
                if (isNaN(a) || !this.use_colors || a < 0 || a > 210) {
                    return '';
                } else{
                    return Ext.String.format('grid-row-inv-fraicheur-{0}', Math.floor(a / 30));
                }
            }, this)
        };

        this.callParent(arguments);

    },

    listeners: {
        // must create the filters after grid is rendered
        // for the filters default value to be set; loading must follow, not precede
        afterrender: function(grid) {
            grid.filters.createFilters();
            grid.getStore().load();
        }
    },

    features: [{
        ftype: 'filters',
        encode: true,
        local: false
    }]

});
