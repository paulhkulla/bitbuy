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

var bbApp = angular.module('bbApp', [
    'ngResource',
    'ngAnimate',
    'ui.router'
]);

bbApp.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
    $rootScope.$state       = $state;
    $rootScope.$stateParams = $stateParams;
}]);

bbApp.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        // Redirects
        $urlRouterProvider
        .otherwise("/buy")
        .when("/buy", '/buy/step-1');

        // State routing
        $stateProvider

            //--------------------- HEADER-NAV STATES ------------------------
            .state('what-is-bitcoin', {
                url         : '/what-is-bitcoin',
                templateUrl : '/app/partials/header-nav/what-is-bitcoin.html',
            })
            .state('how-to-sell', {
                url         : '/how-to-sell',
                templateUrl : '/app/partials/header-nav/how-to-sell.html',
            })
            .state('how-to-buy', {
                url         : '/how-to-buy',
                templateUrl : '/app/partials/header-nav/how-to-buy.html',
            })
            .state('faq', {
                url         : '/faq',
                templateUrl : '/app/partials/header-nav/faq.html',
            })

            //--------------------- FOOTER-NAV STATES ------------------------
            .state('about-us', {
                url         : '/about-us',
                templateUrl : '/app/partials/footer-nav/about-us.html',
            })
            .state('privacy-and-security', {
                url         : '/privacy-and-security',
                templateUrl : '/app/partials/footer-nav/privacy-and-security.html',
            })
            .state('user-agreement', {
                url         : '/user-agreement',
                templateUrl : '/app/partials/footer-nav/user-agreement.html',
            })
            .state('contact', {
                url         : '/contact',
                templateUrl : '/app/partials/footer-nav/contact.html',
            })

            //------------------------- BUY STATES ---------------------------
            .state('buy', {
                url         : '/buy',
                templateUrl : '/app/partials/main/buy/buy.html',
                controller  : 'bbBuyCtrl'
            })
            .state('buy.step-1', {
                url         : '/step-1',
                templateUrl : '/app/partials/main/buy/buy.step-1.html'
            })
            .state('buy.step-2', {
                url         : '/step-2',
                templateUrl : '/app/partials/main/buy/buy.step-2.html',
            })
            .state('buy.step-3', {
                url         : '/step-3',
                templateUrl : '/app/partials/main/buy/buy.step-3.html'
            })
            .state('buy.step-4', {
                url         : '/step-4',
                templateUrl : '/app/partials/main/buy/buy.step-4.html'
            })

            //------------------------ SELL STATES ---------------------------
            .state('sell', {
                url         : '/sell',
                templateUrl : '/app/partials/main/sell/sell.html',
                controller  : 'bbMainCtrl'
            });

    }

]);
