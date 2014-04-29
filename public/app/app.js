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

//---------------- BEGIN MODULE SCOPE VARIABLES ------------------
'use strict';

angular.module( 'app', [ 'ngResource', 'ngRoute' ] );

angular.module( 'app' ).config( function( $routeProvider, $locationProvider ) {
    $locationProvider.html5Mode( true );
    $routeProvider
        .when( '/', { templateUrl: 'app/partials/main.html', controller: 'mainCtrl' } );
});

angular.module( 'app' ).controller( 'mainCtrl', function( $scope ) {
    $scope.myVar = "Osta Bitcoine";
});
