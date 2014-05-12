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
    'ui.bootstrap'
]);

bbApp.run([ 
    '$rootScope',
    '$state',
    '$stateParams',
    '$window',
    'bbIdentitySvc',
    'bbAuthSvc',
    'bbIdleSvc',
    function( $rootScope, $state, $stateParams, $window, bbIdentitySvc, bbAuthSvc, bbIdleSvc ) {
        $rootScope.$state       = $state;
        $rootScope.$stateParams = $stateParams;

        if ( $window.sessionStorage.getItem( 'access_token' ) ) {
            bbAuthSvc.authenticateToken().then( function( success ) {
                if ( success ) {
                    if ( ! bbIdleSvc.isIdleEventsInit ) {
                        bbIdleSvc.initIdleEvents( bbIdentitySvc.currentUser.token_exp );
                    }
                }
            });
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

        // configure idle settings, durations are in seconds
        // idleDuration must be greater than keepaliveProvider.interval!
        $idleProvider.idleDuration( 20 );
        $idleProvider.warningDuration( 15 * 60 );
        $keepaliveProvider.interval( 5 );

        $httpProvider.interceptors.push('authInterceptor');

        $locationProvider.html5Mode( true );

        // Redirects
        $urlRouterProvider
        .otherwise( "/buy" )
        .when( "/buy", '/buy/step-1' );

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
            });

    }

]);

bbApp.factory('authInterceptor', [ '$q', '$window', function( $q, $window ) {
    return {
        request: function ( config ) {
            config.headers = config.headers || {};
            if ( $window.sessionStorage.getItem( 'access_token' ) ) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.getItem( 'access_token' );
            }
            return config || $q.when( config );
        },
        response: function ( response ) {
            if ( response.status === 401 ) {
                console.log("asd");
            }
            return response || $q.when( response );
        }
    };
}]);

