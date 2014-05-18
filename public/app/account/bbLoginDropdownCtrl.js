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
'bbTosModalSvc',
function( $scope, bbLoginSvc, bbAuthSvc, bbTosModalSvc ) {

    $scope.birthday = undefined;
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

    $scope.openTos = function() {
        bbTosModalSvc.tosModal();
        bbTosModalSvc.tosModalInstance.result.then(
            function() {
                $scope.agreeTOS = true;
            }
        );
    };

}]);
