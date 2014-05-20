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
    function( $rootScope, $state, $stateParams, $window, $location, $timeout, bbIdentitySvc, bbIdleSvc ) {
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
        });
        if ( $window.sessionStorage.getItem( 'currentUser' ) ) {
            if ( ! bbIdleSvc.isIdleEventsInit ) {
                bbIdleSvc.initIdleEvents( bbIdentitySvc.currentUser.token_exp );
            }
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

        }
        // configure idle settings, durations are in seconds
        // idleDuration must be greater than keepaliveProvider.interval!
        $idleProvider.idleDuration( 5 * 60 );
        $idleProvider.warningDuration( 15 * 60 );
        $keepaliveProvider.interval( 12 );

        $httpProvider.interceptors.push('authInterceptor');

        $locationProvider.html5Mode( true );

        // Redirects
        $urlRouterProvider
            .when( "/buy", '/buy/step-1' )
            .otherwise( "/buy" );

        // State routing
        $stateProvider
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
            })
            .state( 'user-agreement', {
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
                return config || $q.when( config );
            },
            responseError: function( rejection ) {
                var
                    bbAuthSvc = $injector.get( 'bbAuthSvc' ),
                    bbWarningModalSvc = $injector.get( 'bbWarningModalSvc' ),
                    bbLoginDropdownSvc = $injector.get( 'bbLoginDropdownSvc' );

                if ( rejection.status === 401 ) {
                    bbAuthSvc.logoutUser( false ).then( function() {
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

