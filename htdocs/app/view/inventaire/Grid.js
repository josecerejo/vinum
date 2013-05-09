Ext.define('VIN.view.inventaire.Grid', {

    extend: 'VIN.view.Grid',
    alias: 'widget.inventaire_grid',
    use_colors: true,

    initComponent: function() {

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
                xtype: 'tbspacer',
                width: 5
            }, {
                xtype: 'clearabletextfield',
                enableKeyEvents: true,
                emptyText: 'Filtrer par producteur',
                itemId: 'producteur_external_filter_tf',
                width: 200
            }, {
                xtype: 'tbspacer',
                width: 5
            }, {
                xtype: 'clearabletextfield',
                enableKeyEvents: true,
                emptyText: 'Type de vin',
                itemId: 'type_vin_external_filter_tf',
                width: 200
            }, {
                xtype: 'tbspacer',
                width: 5
            }, {
                xtype: 'clearabletextfield',
                enableKeyEvents: true,
                emptyText: '# produit SAQ',
                itemId: 'no_produit_saq_external_filter_tf',
                width: 200
            }]
        };

        this.viewConfig = {
            getRowClass: Ext.bind(function(record, index, rowParams, store) {
                var a = parseInt(record.get('age_in_days'));
                if (isNaN(a) || !this.use_colors || a < 0 || a > 210) {
                    return '';
                } else{
                    return Ext.String.format('inventaire-grid-row-age-{0}', Math.floor(a / 30));
                }
            }, this),
            preserveScrollOnRefresh: true
        };

        this.callParent(arguments);

    }

});
