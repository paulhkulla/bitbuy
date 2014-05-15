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

    // Inititalize birtday picker
    $("#birthday-picker-dropdown").birthdaypicker({
        dateFormat: "littleEndian",
        minAge: 16,
        maxAge: 110,
        hidden: false,
        placeholder: false,
        defaultDate: "1990-01-01"

    });

    $scope.signin                = bbLoginSvc.signin;
    $scope.username              = bbLoginSvc.username;
    $scope.password              = bbLoginSvc.password;
    $scope.isLoginButtonDisabled = bbLoginSvc.isLoginButtonDisabled;

} ]);
