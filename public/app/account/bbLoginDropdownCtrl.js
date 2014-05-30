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
'bbLoginSvc',
'bbTosModalSvc',
function( $scope, $window, bbLoginSvc, bbTosModalSvc ) {

    var
        parseEmailDomain, returnEmailDomainText;
    
    parseEmailDomain = function( email ) {
        var
        email_string_array     = email.split("@"),
        domain_string_location = email_string_array.length -1,
        final_domain           = email_string_array[domain_string_location];

        return final_domain;
    };

    returnEmailDomainText = function( email ) {
        var domain = parseEmailDomain( email ).toLowerCase();
        switch ( true ) {
            case /gmail/.test( domain ):
            case /googlemail/.test( domain ):
                return "<br><br> Kui soovite võime teid automaatselt <strong>Gmaili</strong> suunata.<br><a href='https://mail.google.com' target='_blank'>Vajuta siia</a> <i class='fa fa-external-link-square'></i>";
            case /outlook/.test( domain ):
            case /hotmail/.test( domain ):
            case /live/.test( domain ):
            case /msn/.test( domain ):
                return "<br><br> Kui soovite võime teid automaatselt <strong>Outlooki</strong> suunata.<br><a href='https://outlook.com' target='_blank'>Vajuta siia</a> <i class='fa fa-external-link-square'></i>";
            case /yahoo/.test( domain ):
            case /ymail/.test( domain ):
            case /rocketmail/.test( domain ):
                return "<br><br> Kui soovite võime teid automaatselt <strong>Yahoo Maili</strong> suunata.<br><a href='https://login.yahoo.com' target='_blank'>Vajuta siia</a> <i class='fa fa-external-link-square'></i>";
            case /hot.ee/.test( domain ):
                return "<br><br> Kui soovite võime teid automaatselt <strong>Hot.ee</strong>'sse suunata.<br><a href='http://live.hot.ee/user/login' target='_blank'>Vajuta siia</a> <i class='fa fa-external-link-square'></i>";
        }
    };

    if ( $window.localStorage.getItem( 'activation_email' ) ) {
        $scope.activation_email = $window.localStorage.getItem( 'activation_email' );
        $scope.activationEmailProviderTxt = returnEmailDomainText( $scope.activation_email );
    }
    if ( $window.sessionStorage.getItem( 'reset_sent_email' ) ) {
        $scope.reset_sent_email = $window.sessionStorage.getItem( 'reset_sent_email' );
        $scope.resetSentEmailProviderTxt = returnEmailDomainText( $scope.reset_sent_email );
    }

    moment.lang( 'et' );
    $scope.birthday               = "1997-01-01";
    $scope.signin                 = bbLoginSvc.signin;
    $scope.username               = bbLoginSvc.username;
    $scope.password               = bbLoginSvc.password;
    $scope.isSubmitButtonDisabled = bbLoginSvc.isSubmitButtonDisabled;

    $scope.signup                 = bbLoginSvc.signup;

    $scope.activate               = bbLoginSvc.activate;

    $scope.sendReset              = bbLoginSvc.sendReset;

    $scope.checkResetCode         = bbLoginSvc.checkResetCode;

    $scope.changePw               = bbLoginSvc.changePw;

    $scope.resendActivationEmail  = bbLoginSvc.resendActivationEmail;

    $scope.parseActivationEmailDomain = function( email ) {
        $scope.activation_email = email;
        $scope.activationEmailProviderTxt = returnEmailDomainText( email );
    };

    $scope.parseResetSentEmailDomain = function( email ) {
        $scope.reset_sent_email = email;
        $scope.resetSentEmailProviderTxt = returnEmailDomainText( email );
    };

    $scope.openTos = function() {
        bbTosModalSvc.tosModal();
        bbTosModalSvc.tosModalInstance.result.then(
            function() {
                $scope.agreeTOS = true;
            }
        );
    };

    $scope.checkPasswordStrength = function( password ) {
        if ( ! password ) { password = ''; }
        $scope.password_result = zxcvbn( password );
        $scope.crack_time = moment.duration( $scope.password_result.crack_time,'seconds' ).humanize();
    };

}]);
