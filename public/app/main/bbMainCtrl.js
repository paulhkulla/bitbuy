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
    'bbLoginSvc',
    'bbIdentitySvc',
    'bbAuthSvc',
    function( $scope, bbLoginDropdownSvc, bbLoginSvc, bbIdentitySvc, bbAuthSvc ) {

    $scope.bbLoginDropdownSvc = bbLoginDropdownSvc;
    $scope.signout            = bbAuthSvc.logoutUser;
    $scope.identity           = bbIdentitySvc;

    $scope.currentYear        = new Date().getFullYear();

    $scope.minifyMenu         = function () {
        $scope.isMinified = $scope.isMinified ? false : true;
    };

}]);
