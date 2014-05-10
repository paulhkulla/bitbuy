/*
 * bbAuthSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

bbApp.factory( 'bbAuthSvc', [ 
    '$http',
    'bbIdentitySvc',
    '$q',
    '$window',
    '$location',
    function( $http, bbIdentitySvc, $q, $window, $location ) {

        return {
            authenticateUser: function( username, password ) {

                var dfd = $q.defer();

                $http.post( '/login', { username : username, password : password } ).then( function( response ) {
                    if( response.data.success ) {
                        bbIdentitySvc.currentUser           = response.data.user;
                        $window.sessionStorage.access_token = response.data.user.access_token;
                        dfd.resolve( true );
                    }
                    else {
                        dfd.resolve( false );
                    }
                });

                return dfd.promise;
            },

            authenticateToken: function() {

                var dfd = $q.defer();

                $http.post( '/login', { auth_type : 'access_token' } ).then( function( response ) {
                    if( response.data.success ) {
                        bbIdentitySvc.currentUser           = response.data.user;
                        $window.sessionStorage.access_token = response.data.user.access_token;
                        dfd.resolve( true );
                    }
                    else {
                        dfd.resolve( false );
                    }
                });

                return dfd.promise;
            },

            logoutUser: function() {
                var dfd = $q.defer();

                $http.post( '/logout', { username : bbIdentitySvc.currentUser.username } ).then( function() {
                        $window.sessionStorage.removeItem( 'access_token' );
                        bbIdentitySvc.currentUser = undefined;
                        dfd.resolve( true );
                });

                return dfd.promise;
            }
        };
}]);
