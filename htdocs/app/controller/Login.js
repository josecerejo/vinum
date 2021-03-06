Ext.define('VIN.controller.Login', {

    extend: 'Ext.app.Controller',

    init: function() {

        this.control({

            '#login_btn': {
                click: function(btn) {
                    this.login(btn);
                }
            },

            '#login_f textfield': {
                specialkey: function(tf, e, eOpts) {
                    if (e.getKey() === e.ENTER) {
                        this.login(tf);
                    }
                }
            }

        });

    },

    login: function(widget) {
        var win = widget.up('#login_w');
        var form = win.down('#login_f');
        if (!form.getForm().isValid()) { return; }
        form.submit({
            url: ajax_url_prefix + '/login',
            success: Ext.bind(function(_form, action) {
                current_user = action.result;
                this.setUserPrivileges(current_user);
                win.hide();
                win.successful_login_callback();
                win.successful_login_callback = Ext.emptyFn;
            }, this),
            failure: function(_form, action) {
                if (action.result.error === 'username') {
                    form.down('#username_tf').markInvalid("Ce nom d'usager n'est pas valide");
                } else if (action.result.error === 'password') {
                    form.down('#password_tf').markInvalid("Ce mot de passe n'est pas valide");
                }
            }
        });
    },

    setUserPrivileges: function(u) {
        jQuery('#login_name').html(Ext.String.format('{0} ({1})', u.usager_nom, u.representant_id ? 'représentant' : 'admin'));
        var dv = Ext.getCmp('main_pnl').down('dataview');
        if (u.representant_id) {
            jQuery(dv.all.elements[0]).addClass('x-item-disabled');
            jQuery(dv.all.elements[1]).addClass('x-item-disabled');
            jQuery(dv.all.elements[4]).addClass('x-item-disabled');
        } else {
            jQuery(dv.all.elements[0]).removeClass('x-item-disabled');
            jQuery(dv.all.elements[1]).removeClass('x-item-disabled');
            jQuery(dv.all.elements[4]).removeClass('x-item-disabled');
        }
        Ext.getCmp('create_commande_menu_itm').setDisabled(u.representant_id);
        Ext.getCmp('edit_client_menu_itm').setDisabled(u.representant_id);
        Ext.getCmp('produits_pp_menu_itm').setDisabled(u.representant_id);
        Ext.getCmp('bo_create_menu_itm').setDisabled(u.representant_id);
        Ext.getCmp('bottin_restos_menu_itm').setDisabled(!u.representant_id);
    }

});
