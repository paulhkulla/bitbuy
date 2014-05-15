/*
 * bbLoginDropdownCtrl.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.controller( 'bbLoginDropdownCtrl', [ '$scope', 'bbLoginSvc', function( $scope, bbLoginSvc ) {

    $scope.signin                = bbLoginSvc.signin;
    $scope.username              = bbLoginSvc.username;
    $scope.password              = bbLoginSvc.password;
    $scope.isLoginButtonDisabled = bbLoginSvc.isLoginButtonDisabled;

} ]);
