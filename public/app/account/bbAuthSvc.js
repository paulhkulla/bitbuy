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
    '$idle',
    '$keepalive',
    'bbLockedModalSvc',
    'authService',
    function( $http, bbIdentitySvc, $q, $window, $idle, $keepalive, bbLockedModalSvc, authService ) {

        var initSession = function( data ) {
            bbIdentitySvc.currentUser           = data.user;
            $window.sessionStorage.currentUser  = JSON.stringify(bbIdentitySvc.currentUser);
            bbIdentitySvc.authenticated         = true;
            $window.sessionStorage.access_token = data.user.access_token;
            $window.localStorage.removeItem( 'currentUser' );
            $window.localStorage.removeItem( 'locked' );
            bbIdentitySvc.locked                = false;
            if ( bbLockedModalSvc.lockedModalInstance ) {
                bbLockedModalSvc.lockedModalInstance.close();
                bbLockedModalSvc.lockedModalInstance = undefined;
            }

        };

        return {
            authenticateUser: function( username, password ) {

                var dfd = $q.defer();

                $http.post( '/login', { username : username, password : password } ).then( function( response ) {
                    if( response.data.success ) {
                        initSession( response.data );
                        authService.loginConfirmed();
                        dfd.resolve( true );
                    }
                    else {
                        dfd.resolve( false );
                    }
                }, function ( rejection ) {
                    dfd.resolve( false );
                });

                return dfd.promise;
            },

            authenticateToken: function() {

                var dfd = $q.defer();

                $http.post( '/login', { auth_type : 'access_token' } ).then( function( response ) {
                    if ( response.data.success ) {
                        initSession( response.data );
                        dfd.resolve( true );
                    }
                });

                return dfd.promise;
            },

            logoutUser: function( lock ) {

                $idle.unwatch();
                $keepalive.stop();

                var dfd = $q.defer();

                $http.post( '/logout', { auth_type : 'access_token' } ).then( function() {
                        bbIdentitySvc.authenticated = false;
                        $window.sessionStorage.removeItem( 'access_token' );
                        $window.sessionStorage.removeItem( 'currentUser' );

                        if ( lock ) {
                            bbIdentitySvc.locked             = true;
                            $window.localStorage.currentUser = JSON.stringify(bbIdentitySvc.currentUser);
                            $window.localStorage.locked      = JSON.stringify(bbIdentitySvc.locked);

                            bbLockedModalSvc.lockedModal();
                        }
                        else {
                            $window.localStorage.removeItem( 'currentUser' );
                            $window.localStorage.removeItem( 'locked' );
                            bbIdentitySvc.currentUser = undefined;
                            bbIdentitySvc.locked      = false;

                            if ( bbLockedModalSvc.lockedModalInstance ) {
                                bbLockedModalSvc.lockedModalInstance = undefined;
                            }
                        }
                        dfd.resolve( false );
                });

                return dfd.promise;
            }
        };
}]);
