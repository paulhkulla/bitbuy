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
    '$location',
    'bbLoginDropdownSvc',
    'bbLogoutSvc',
    'bbAuthSvc',
    'bbIdentitySvc',
    'bbWarningModalSvc',
    function( $scope, $location, bbLoginDropdownSvc, bbLogoutSvc, bbAuthSvc, bbIdentitySvc, bbWarningModalSvc ) {

        $scope.bbLoginDropdownSvc = bbLoginDropdownSvc;
        $scope.signout            = bbLogoutSvc.signout;
        $scope.identity           = bbIdentitySvc;

        $scope.currentYear        = new Date().getFullYear();

        $scope.minifyMenu         = function () {
            $scope.isMinified = $scope.isMinified ? false : true;
        };

}]);
