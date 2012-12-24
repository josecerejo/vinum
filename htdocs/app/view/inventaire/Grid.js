Ext.define('VIN.view.inventaire.Grid', {

    extend: 'VIN.view.Grid',
    alias: 'widget.inventaire_grid',
    title: 'Inventaire',
    closable: true,
    use_paging_toolbar: false,
    use_colors: true,
    is_master_grid: true,

    initComponent: function() {

        if (this.is_master_grid) {
            this.dockedItems = {
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    text: 'Colorer en fonction de l\'âge',
                    enableToggle: true,
                    itemId: 'show_colors_btn',
                    iconCls: 'color-icon',
                    pressed: true
                }, {
                    xtype: 'textfield',
                    enableKeyEvents: true,
                    fieldLabel: 'Filtrer par type de vin',
                    itemId: 'type_vin_external_filter_tf',
                    labelWidth: 120
                }]
            };

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
        }

        // this.listeners = {
        //     // must create the filters after grid is rendered
        //     // for the filters default value to be set; loading must follow, not precede
        //     afterrender: function(grid) {
        //         grid.filters.createFilters();
        //         if (this.is_master_grid) {
        //             grid.getStore().load();
        //         }
        //     }
        // };

        this.callParent(arguments);

    }

});
