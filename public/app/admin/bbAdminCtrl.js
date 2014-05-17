/*
 * bbAdminCtrl.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.controller( 'bbAdminCtrl', [
    '$scope',
    '$http',
    'bbAuthSvc',
    'bbIdentitySvc',
    function( $scope, $http, bbAuthSvc, bbIdentitySvc ) {
        if ( ! bbIdentitySvc.locked ) {
            $http.get( '/api/users' ).then( function( response ) {
                // bbAuthSvc.initSession( response.data );
                $scope.users = response.data.collection;
            });
        }
}]);
