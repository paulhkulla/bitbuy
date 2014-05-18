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

bbApp.controller( 'bbLoginDropdownCtrl', [
'$scope',
'bbLoginSvc',
'bbAuthSvc',
function( $scope, bbLoginSvc, bbAuthSvc ) {

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

    $scope.signup = function() {
        var newUserData = {
            username  : $scope.email,
            password  : $scope.r_password,
            firstName : $scope.firstName,
            lastName  : $scope.lastName,
            birthday  : $scope.birthday,
        };
        console.log(newUserData);

        bbAuthSvc.createUser( newUserData ).then( function() {
            // success
        }, function ( reason ) {
            // error
            console.log(reason);
        });
    };

} ]);
