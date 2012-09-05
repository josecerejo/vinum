Ext.define('VIN.view.LeftNavPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.left_nav_panel',
    collapsible: true,
    animCollapse: true,
    layout: 'fit',
    items: {
        xtype: 'dataview',
        trackOver: true,
        store: Ext.create('Ext.data.Store', {
            model: Ext.define('LeftNavMenuIteModel', {
                extend: 'Ext.data.Model',
                fields: [{name: 'nav_menu_item'},
                         {name: 'target_main_section_idx', type: 'int'},
                         {name: 'img'}]
            }),
            data: [{nav_menu_item: 'Clients', target_main_section_idx: 0, img: 'group.png'},  
                   {nav_menu_item: 'Commandes', target_main_section_idx: 1, img: 'cart.png'},
                   {nav_menu_item: 'Produits', target_main_section_idx: 2, img: 'drink.png'},
                   {nav_menu_item: 'Inventaire', target_main_section_idx: 3, img: 'database.png'}]
        }),
        cls: 'nav-menu',
        itemSelector: '.nav-menu-item',
        overItemCls: 'nav-menu-item-hover',
        tpl: '<tpl for="."><div class="nav-menu-item"><img src="resources/images/icons/{img}" class="nav-menu-item-img" />{nav_menu_item}</div></tpl>'
    }
});
