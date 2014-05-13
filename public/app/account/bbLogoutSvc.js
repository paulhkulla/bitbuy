/*
 * bbLogoutSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.factory('bbLogoutSvc', [
    'bbIdentitySvc',
    'bbAuthSvc',
    function( bbIdentitySvc, bbAuthSvc ) {

        return {
            signout                : function( lock ) {

                bbAuthSvc.logoutUser( lock ).then( function() {

                    if ( lock === "lock_automatically" ) {
                        $.smallBox({
                            title : "Konto lukustatud!",
                            content : "<i class='fa fa-clock-o'></i> Olite üle "
                            + humanizeDuration( bbIdentitySvc.currentUser.token_exp, "et" )
                            + " mitteaktiivne, seega lukustasime teie konto teie turvalisuse huvides."
                            + " Juurdepääsu taastamiseks sisestage enda parool...",
                            color : "#3B9FF3",
                            // timeout: 8000,
                            iconSmall : "fa fa-shield fadeInLeft animated"
                        }); 
                    }
                    else if ( lock === "lock_manually" ) {
                        $.smallBox({
                            title : "Konto lukustatud!",
                            content : "<i class='fa fa-unlock'></i> Juurdepääsu taastamiseks sisestage enda parool...",
                            color : "#96BF48",
                            timeout: 8000,
                            iconSmall : "fa fa-check fadeInLeft animated"
                        }); 
                    }
                    else {
                        $.smallBox({
                            title : "Nägemiseni!",
                            content : "<i class='fa fa-sign-out'></i> Olete edukalt välja logitud...",
                            color : "#96BF48",
                            timeout: 8000,
                            iconSmall : "fa fa-check fadeInLeft animated"
                        }); 
                    }

                });
            }
        };
    }]);
