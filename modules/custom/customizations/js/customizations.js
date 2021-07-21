jQuery(function() {
    jQuery(".saml-login-cancel").click(function(){
    	jQuery("#user-login-form").removeClass('sr-only');
   		jQuery(".login-links").hide();
   	});
});