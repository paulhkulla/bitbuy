/*
 * bbLoginSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.factory('bbLoginSvc', [
    '$location',
    '$window',
    'bbLoginDropdownSvc',
    'bbIdentitySvc',
    'bbAuthSvc',
    'bbIdleSvc',
    function( $location, $window, bbLoginDropdownSvc, bbIdentitySvc, bbAuthSvc, bbIdleSvc ) {

        return {

            isLoginButtonDisabled : false,

            signin                : function(username, password) {

                var that = this;

                this.isLoginButtonDisabled = true;

                bbAuthSvc.authenticateUser( username, password ).then( function( success ) {

                    that.isLoginButtonDisabled = false;

                    if ( success ) {

                        bbIdleSvc.initIdleEvents( bbIdentitySvc.currentUser.token_exp );

                        bbLoginDropdownSvc.isDropdownActive = false;

                        $.smallBox({
                            title : "Teretulemast tagasi, <strong>" + bbIdentitySvc.currentUser.firstName + "</strong>!",
                            content : "<i>&ldquo;Parim aeg puu istutamiseks oli 20 aastat tagasi. Teine parim aeg on hetkel.&rdquo;</i> <small>-Hiina vanasõna</small>",
                            color : "#96BF48",
                            timeout: 8000,
                            icon : "fa fa-check fadeInLeft animated"
                        }); 
                    }
                    else {
                        $.smallBox({
                            title : "Sisestasite vale e-maili ja/või parooli!",
                            content : "Palun proovige uuesti!",
                            color : "#c7262c",
                            timeout: 3000,
                            iconSmall : "fa fa-times shake animated"
                        }); 
                    }
                });
            },

            signout               : function() {
                bbAuthSvc.logoutUser().then( function() {
                    $.smallBox({
                        title : "Nägemiseni!",
                        content : "<i class='fa fa-sign-out'></i> Olete edukalt välja logitud!",
                        color : "#96BF48",
                        timeout: 8000,
                        iconSmall : "fa fa-check fadeInLeft animated"
                    }); 
                    $location.path('/');
                });
            }
        };
    }]);
