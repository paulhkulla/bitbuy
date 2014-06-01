/*
 * app.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular */

'use strict';

var bbApp = angular.module( 'bbApp', [
    'ngResource',
    'ngAnimate',
    'ngIdle',
    'ui.router',
    'ui.bootstrap',
    'ui.utils'
]);

bbApp.run([ 
    '$rootScope',
    '$state',
    '$stateParams',
    '$window',
    '$location',
    '$timeout',
    'bbIdentitySvc',
    'bbIdleSvc',
    'bbLoginDropdownSvc',
    function( $rootScope, $state, $stateParams, $window, $location, $timeout, bbIdentitySvc, bbIdleSvc, bbLoginDropdownSvc ) {
        $rootScope.$state       = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$on( '$stateChangeError', function( event, toState, toParams, fromState, fromParams, error ) {
            if ( error === 'not authorized' ) {
                $timeout( function() { 
                    $location.path('/');
                    $.smallBox({
                        title : "Juurdepääs keelatud!",
                        content : "Teil puuduvad piisavad õigused selle lehe vaatamiseks!",
                        color : "#c7262c",
                        timeout: 8000,
                        iconSmall : "fa fa-times shake animated"
                    }); 
                });
            }
            if ( error === 'valid confirmation token' ) {
                bbLoginDropdownSvc.isActivationToken = false;
                $timeout( function() { 
                    $location.path('/');
                    $.smallBox({
                        title : "Teie konto on aktiveeritud, <strong>" + bbIdentitySvc.currentUser.firstName + "</strong>!",
                        content : "Täname teid, et liitusite. Anname endast parima ning teeme kõik, et naudiksite siin viibimist!<br><br><i>&ldquo;Parim aeg puu istutamiseks oli 20 aastat tagasi. Teine parim aeg on hetkel.&rdquo;</i> <small>-Hiina vanasõna</small>",
                        color : "#96BF48",
                        timeout: 12000,
                        icon : "fa fa-check fadeInLeft animated"
                    });
                });
            }
            if ( error === 'invalid confirmation token' ) {
                $timeout( function() { 
                    $location.path('/');
                    $.smallBox({
                        title : "Esines viga!",
                        content : "Konto aktiveerimine ebaõnnestus! Konto võib juba olla aktiivne või esines viga serveriga. Palun proovige sisse logida või uuesti aktiveerida. Probleemi jätkumisel palun kontakteeruge klienditeenindusega.",
                        color : "#c7262c",
                        timeout: 12000,
                        iconSmall : "fa fa-times shake animated"
                    }); 
                });
            }
            if ( error === 'valid reset token' ) {
                bbLoginDropdownSvc.isResetConfirmedToken = true;
                bbLoginDropdownSvc.activateTab( 'forgot' );
                bbLoginDropdownSvc.activateDropdown();
                $timeout( function() { 
                    $location.path('/');
                        $.smallBox({
                            title : "Parooli muutmine edukalt kinnitatud!",
                            content : "Palun valige nüüd uus parool!",
                            color : "#96BF48",
                            timeout: 12000,
                            icon : "fa fa-check fadeInLeft animated"
                        });
                });
            }
            if ( error === 'invalid reset token' ) {
                $timeout( function() { 
                    $location.path('/');
                    $.smallBox({
                        title : "Esines viga!",
                        content : "Parooli kinnitamise URL võis olla vigane või esines viga serveriga. Palun proovige uuesti või tellige uus kinnitus. Probleemi jätkumisel palun kontakteeruge klienditeenindusega.",
                        color : "#c7262c",
                        timeout: 12000,
                        iconSmall : "fa fa-times shake animated"
                    }); 
                });
            }
            if ( error === 'reset token expired' ) {
                $timeout( function() { 
                    $location.path('/');
                    $.smallBox({
                        title : "Parooli muutmise kinnitamine ebaõnnestus!",
                        content : "Kinnituse URL on aegunud. Palun tellige uus kinnitus!",
                        color : "#c7262c",
                        timeout: 12000,
                        iconSmall : "fa fa-times shake animated"
                    }); 
                });
            }
        });
        if ( $window.sessionStorage.getItem( 'currentUser' ) ) {
            if ( ! bbIdleSvc.isIdleEventsInit ) {
                bbIdleSvc.initIdleEvents( bbIdentitySvc.currentUser.token_exp );
            }
        }
        if ( $window.localStorage.getItem( 'activation_token' ) ) {
            bbLoginDropdownSvc.isActivationToken = true;
        }
        if ( $window.sessionStorage.getItem( 'reset_sent_email' ) ) {
            bbLoginDropdownSvc.isResetSent = true;
        }
        if ( $window.sessionStorage.getItem( 'reset_confirmed_token' ) ) {
            bbLoginDropdownSvc.isResetConfirmedToken = true;
        }
    }]);

bbApp.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    '$httpProvider',
    '$idleProvider',
    '$keepaliveProvider',
    function( $stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $idleProvider, $keepaliveProvider ) {

        var routeRoleChecks = {
            admin : { auth : [ 'bbAuthSvc', function ( bbAuthSvc ) {
                return bbAuthSvc.authorizeCurrentUserForRoute( 'admin' );
            }]},
            user : { auth : [ 'bbAuthSvc', function ( bbAuthSvc ) {
                return bbAuthSvc.authorizeCurrentUserForRoute( 'user' );
            }]}

        },

        checkConfirmationToken = {
            check : [ '$stateParams', 'bbAuthSvc', function ( $stateParams, bbAuthSvc ) {
                return bbAuthSvc.checkConfirmationToken( $stateParams.confirmationToken );
            }]
        },

        checkResetToken = {
            check : [ '$stateParams', 'bbAuthSvc', function ( $stateParams, bbAuthSvc ) {
                return bbAuthSvc.checkResetToken( $stateParams.resetToken );
            }]
        }

        // configure idle settings, durations are in seconds
        // idleDuration must be greater than keepaliveProvider.interval!
        $idleProvider.idleDuration( 5 * 60 );
        $idleProvider.warningDuration( 15 * 60 );
        $keepaliveProvider.interval( 2 * 60 );

        $httpProvider.interceptors.push('authInterceptor');

        $locationProvider.html5Mode( true );

        // Redirects
        $urlRouterProvider
            .when( "/buy", '/buy/step-1' )
            .otherwise( "/buy" );

        // State routing
        $stateProvider
            .state( 'email_confirmation', {
                url         : '/confirm/{confirmationToken}',
                resolve     : checkConfirmationToken
            })
            .state( 'reset_confirmation', {
                url         : '/confirm_reset/{resetToken}',
                resolve     : checkResetToken
            })
            //--------------------- HEADER-NAV STATES ------------------------
            .state( 'what-is-bitcoin', {
                url         : '/what-is-bitcoin',
                templateUrl : '/app/header-nav/what-is-bitcoin.html',
            })
            .state( 'how-to-sell', {
                url         : '/how-to-sell',
                templateUrl : '/app/header-nav/how-to-sell.html',
            })
            .state( 'how-to-buy', {
                url         : '/how-to-buy',
                templateUrl : '/app/header-nav/how-to-buy.html',
            })
            .state( 'faq', {
                url         : '/faq',
                templateUrl : '/app/header-nav/faq.html',
            })

            //--------------------- FOOTER-NAV STATES ------------------------
            .state( 'about-us', {
                url         : '/about-us',
                templateUrl : '/app/footer-nav/about-us.html',
            })
            .state( 'privacy-and-security', {
                url         : '/privacy-and-security',
                templateUrl : '/app/footer-nav/privacy-and-security.html',
            }) .state( 'user-agreement', {
                url         : '/user-agreement',
                templateUrl : '/app/footer-nav/user-agreement.html',
            })
            .state( 'contact', {
                url         : '/contact',
                templateUrl : '/app/footer-nav/contact.html',
            })

            //------------------------- BUY STATES ---------------------------
            .state( 'buy', {
                url         : '/buy',
                templateUrl : '/app/buy/buy.html',
                controller  : 'bbBuyCtrl'
            })
            .state( 'buy.step-1', {
                url         : '/step-1',
                templateUrl : '/app/buy/buy.step-1.html'
            })
            .state( 'buy.step-2', {
                url         : '/step-2',
                templateUrl : '/app/buy/buy.step-2.html',
            })
            .state( 'buy.step-3', {
                url         : '/step-3',
                templateUrl : '/app/buy/buy.step-3.html'
            })
            .state( 'buy.step-4', {
                url         : '/step-4',
                templateUrl : '/app/buy/buy.step-4.html'
            })

            //------------------------ SELL STATES ---------------------------
            .state( 'sell', {
                url         : '/sell',
                templateUrl : '/app/sell/sell.html',
                controller  : 'bbMainCtrl'
            })

            //-------------------- ADMIN PANEL STATES -----------------------
            .state( 'admin', {
                url         : '/admin',
                templateUrl : '/app/admin/admin.html',
                resolve     : routeRoleChecks.user,
                controller  : 'bbAdminCtrl'
            });

    }

]);

bbApp.factory('authInterceptor', [
    '$q',
    '$window',
    '$injector',
    '$timeout',
    '$location',
    function( $q, $window, $injector, $timeout, $location ) {
        return {
            request: function ( config ) {
                config.headers = config.headers || {};
                if ( $window.sessionStorage.getItem( 'access_token' ) ) {
                    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.getItem( 'access_token' );
                }
                if ( $window.localStorage.getItem( 'activation_token' ) ) {
                    config.headers.Authorization = 'Bearer ' + $window.localStorage.getItem( 'activation_token' );
                }
                return config || $q.when( config );
            },
            responseError: function( rejection ) {
                var
                    bbAuthSvc = $injector.get( 'bbAuthSvc' ),
                    bbWarningModalSvc = $injector.get( 'bbWarningModalSvc' ),
                    bbLoginDropdownSvc = $injector.get( 'bbLoginDropdownSvc' );


                if ( rejection.status === 401 ) {
                    bbAuthSvc.logoutUser( false );
                    $location.path('/');
                    if ( bbWarningModalSvc.warningModalInstance ) {
                        bbWarningModalSvc.warningModalInstance.close();
                        bbWarningModalSvc.warningModalInstance = undefined;
                    }
                    bbLoginDropdownSvc.activateTab( 'login' );
                    bbLoginDropdownSvc.activateDropdown();
                    $.smallBox({
                        title : "Juurdepääs keelatud!",
                        content : "Jätkamiseks palun logige sisse!",
                        color : "#c7262c",
                        timeout: 8000,
                        iconSmall : "fa fa-times shake animated"
                    }); 
                }
                if ( rejection.status === 403 ) {
                    $.smallBox({
                        title : "Juurdepääs keelatud!",
                        content : "Teil puuduvad piisavad õigused selle lehe vaatamiseks!",
                        color : "#c7262c",
                        timeout: 8000,
                        iconSmall : "fa fa-times shake animated"
                    }); 
                }
                // otherwise, default behaviour
                return $q.reject(rejection);
            }
        };
}]);

