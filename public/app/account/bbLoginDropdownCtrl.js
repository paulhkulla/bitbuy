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

    moment.lang( 'et' );
    $scope.birthday = "1997-01-01";
    $scope.signin                 = bbLoginSvc.signin;
    $scope.username               = bbLoginSvc.username;
    $scope.password               = bbLoginSvc.password;
    $scope.isSubmitButtonDisabled = bbLoginSvc.isSubmitButtonDisabled;

    $scope.signup = bbLoginSvc.signup;

    $scope.openTos = function() {
        bbTosModalSvc.tosModal();
        bbTosModalSvc.tosModalInstance.result.then(
            function() {
                $scope.agreeTOS = true;
            }
        );
    };

    $scope.checkPasswordStrength = function() {
        if ( ! $scope.r_password ) { $scope.r_password = ''; }
        $scope.password_result = zxcvbn( $scope.r_password );
        $scope.crack_time = moment.duration( $scope.password_result.crack_time,'seconds' ).humanize();
    };

}]);
