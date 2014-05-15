/*
 * bbMainCtrl.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.controller( 'bbMainCtrl', [
    '$scope',
    'bbLoginDropdownSvc',
    'bbLogoutSvc',
    'bbAuthSvc',
    'bbIdentitySvc',
    'bbWarningModalSvc',
    function( $scope, bbLoginDropdownSvc, bbLogoutSvc, bbAuthSvc, bbIdentitySvc, bbWarningModalSvc ) {

        $scope.bbLoginDropdownSvc = bbLoginDropdownSvc;
        $scope.signout            = bbLogoutSvc.signout;
        $scope.identity           = bbIdentitySvc;

        $scope.currentYear        = new Date().getFullYear();

        $scope.minifyMenu         = function () {
            $scope.isMinified = $scope.isMinified ? false : true;
        };

        $scope.$on( 'event:auth-loginRequired', function() {
            
            bbAuthSvc.logoutUser( false ).then( function() {
                if ( bbWarningModalSvc.warningModalInstance ) {
                    bbWarningModalSvc.warningModalInstance.close();
                    bbWarningModalSvc.warningModalInstance = undefined;
                }
                bbLoginDropdownSvc.activateTab( 'login' );
                bbLoginDropdownSvc.activateDropdown();
                $.smallBox({
                    title : 'Juurdepääs piiratud',
                    content : "Jätkamiseks palun logige sisse!",
                    color : "#c7262c",
                    timeout: 8000,
                    iconSmall : "fa fa-times shake animated"
                }); 
            });
        });

}]);
