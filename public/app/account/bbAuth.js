/*
 * bbAuth.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

bbApp.factory( 'bbAuth', [ '$http', 'bbIdentity', '$q', function( $http, bbIdentity, $q ) {
    return {
        authenticateUser: function( username, password ) {

            var dfd = $q.defer();

            $http.post( '/login', { username : username, password : password } ).then( function( response ) {
                if( response.data.success ) {
                    bbIdentity.currentUser = response.data.user;
                    dfd.resolve( true );
                }
                else {
                    dfd.resolve( false );
                }
            });

            return dfd.promise;
        }

    };

}]);
