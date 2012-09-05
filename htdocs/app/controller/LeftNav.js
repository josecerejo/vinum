Ext.define('VIN.controller.LeftNav', {
    extend: 'Ext.app.Controller',
    views: ['VIN.view.LeftNavPanel'],
    init: function() {
        this.control({
            'left_nav_panel dataview': {
                viewready: function(dv) {
                    dv.getSelectionModel().select(0);
                },                
                selectionchange: function(model, selected) {
                    var target_main_section_idx = selected[0].data.target_main_section_idx;
                    Ext.getCmp('main_pnl').getLayout().setActiveItem(target_main_section_idx);
                }                
            }
        });
    }
});
