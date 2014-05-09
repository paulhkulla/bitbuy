/*
 * bbLoginCtrl.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.controller('bbLoginCtrl', [
    '$rootScope',
    '$scope',
    '$window',
    'bbLoginDropdownSvc',
    'bbIdentitySvc',
    'bbAuthSvc',
    function( $rootScope, $scope, $window, bbLoginDropdownSvc, bbIdentitySvc, bbAuthSvc ) {

        $scope.bbLoginDropdownSvc    = bbLoginDropdownSvc;
        $scope.identity              = bbIdentitySvc;
        $scope.isLoginButtonDisabled = false;

        if ( $window.sessionStorage.getItem( 'access_token' ) ) {
            bbAuthSvc.authenticateToken().then( function( success ) {
                if ( success ) {
                    $rootScope.$emit( 'initIdleEvents' );
                }
            });
        }

        $scope.signin = function(username, password) {

            $scope.isLoginButtonDisabled = true;

            bbAuthSvc.authenticateUser( username, password ).then( function( success ) {

                $scope.isLoginButtonDisabled = false;

                if ( success ) {

                    $rootScope.$emit( 'initIdleEvents' );

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

        };
    }
]);
