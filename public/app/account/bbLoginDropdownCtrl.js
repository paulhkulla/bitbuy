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
'$window',
'bbAuthSvc',
'bbLoginSvc',
'bbTosModalSvc',
function( $scope, $window, bbAuthSvc, bbLoginSvc, bbTosModalSvc ) {

    var parseEmailDomain = function( email ) {
        var
            email_string_array     = email.split("@"),
            domain_string_location = email_string_array.length -1,
            final_domain           = email_string_array[domain_string_location];

        return final_domain;
    };

    moment.lang( 'et' );
    $scope.birthday               = "1997-01-01";
    $scope.signin                 = bbLoginSvc.signin;
    $scope.username               = bbLoginSvc.username;
    $scope.password               = bbLoginSvc.password;
    $scope.isSubmitButtonDisabled = bbLoginSvc.isSubmitButtonDisabled;

    $scope.signup                 = bbLoginSvc.signup;

    $scope.activate               = bbLoginSvc.activate;

    $scope.parseEmailDomain = function() {
        $scope.emailDomain = parseEmailDomain( $scope.email ).toLowerCase();
        switch ( true ) {
            case /gmail/.test( $scope.emailDomain ):
            case /googlemail/.test( $scope.emailDomain ):
                $scope.directToEmailProviderTxt = "<br><br> Kui soovite võime teid automaatselt Gmaili suunata.<br><a href='https://mail.google.com' target='_blank'>Vajuta siia</a> <i class='fa fa-external-link-square'></i>"
                break;
            case /outlook/.test( $scope.emailDomain ):
            case /hotmail/.test( $scope.emailDomain ):
            case /live/.test( $scope.emailDomain ):
            case /msn/.test( $scope.emailDomain ):
                $scope.directToEmailProviderTxt = "<br><br> Kui soovite võime teid automaatselt Outlooki suunata.<br><a href='https://outlook.com' target='_blank'>Vajuta siia</a> <i class='fa fa-external-link-square'></i>"
                break;
            case /yahoo/.test( $scope.emailDomain ):
            case /ymail/.test( $scope.emailDomain ):
            case /rocketmail/.test( $scope.emailDomain ):
                $scope.directToEmailProviderTxt = "<br><br> Kui soovite võime teid automaatselt Yahoo Maili suunata.<br><a href='https://login.yahoo.com' target='_blank'>Vajuta siia</a> <i class='fa fa-external-link-square'></i>"
                break;
            case /hot.ee/.test( $scope.emailDomain ):
                $scope.directToEmailProviderTxt = "<br><br> Kui soovite võime teid automaatselt Hot.ee'sse suunata.<br><a href='http://live.hot.ee/' target='_blank'>Vajuta siia</a> <i class='fa fa-external-link-square'></i>"
                break;
        }
    };

    if ( $window.localStorage.getItem( 'activation_email' ) ) {
        $scope.email = $window.localStorage.getItem( 'activation_email' );
        $scope.parseEmailDomain();
    }
    

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
