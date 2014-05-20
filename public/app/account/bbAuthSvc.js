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
    '$q',
    '$window',
    '$idle',
    '$keepalive',
    'bbIdentitySvc',
    'bbLockedModalSvc',
    'bbUser',
    function( $http, $q, $window, $idle, $keepalive, bbIdentitySvc, bbLockedModalSvc, bbUser ) {

        var initSession = function( data ) {
            var user = new bbUser();
            angular.extend( user, data.user );
            bbIdentitySvc.currentUser           = user;
            $window.sessionStorage.currentUser  = JSON.stringify( bbIdentitySvc.currentUser );
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

            initSession : initSession,

            authenticateUser : function( username, password ) {

                var dfd = $q.defer();

                $http.post( '/login',
                    { username : username, password : password, auth_type : 'credentials' } )
                        .then( function( response ) {
                            if( response.data.success ) {
                                initSession( response.data );
                                dfd.resolve( response.data );
                            }
                            else {
                                dfd.resolve( response.data );
                            }
                        }, function ( rejection ) {
                            dfd.resolve( rejection.data );
                        });

                return dfd.promise;
            },

            authenticateToken : function() {

                var dfd = $q.defer();

                $http.post( '/login' ).then( function( response ) {
                    if ( response.data.success ) {
                        initSession( response.data );
                        dfd.resolve( true );
                    }
                });

                return dfd.promise;
            },

            createUser : function( newUserData ) {
                var 
                    newUser = new bbUser( newUserData ),
                    dfd = $q.defer();

                newUser.$save().then( function( response ) {
                    console.log(response);
                    $window.localStorage.activation_token = response.access_token;
                    $window.localStorage.activation_email = newUserData.username;
                    dfd.resolve();
                }, function( response ) {
                    console.log( response );
                    dfd.reject( response.data.reason );
                });

                return dfd.promise;
            },

            logoutUser : function( lock ) {

                $idle.unwatch();
                $keepalive.stop();

                $http.post( '/logout' ).then( function( response ) {
                    bbIdentitySvc.authenticated = false;
                    $window.sessionStorage.removeItem( 'access_token' );
                    $window.sessionStorage.removeItem( 'currentUser' );
                });

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
            },

            authorizeCurrentUserForRoute : function ( role ) {
                if ( bbIdentitySvc.isAuthorized( role ) ) {
                    return true;
                } 
                return $q.reject( 'not authorized' );
            },

            checkConfirmationToken : function( confirmation_token ) {
                var dfd = $q.defer();
                $http.get( '/confirm_email/' + confirmation_token ).then( function( response ) {
                    if ( response.data.success ) {
                        $window.localStorage.removeItem( 'activation_token' );
                        $window.localStorage.removeItem( 'activation_email' );
                        initSession( response.data );
                        dfd.reject( 'valid confirmation token' );
                    }
                    else {
                        dfd.reject( 'invalid confirmation token' );
                    }
                });
                return dfd.promise;
            },

            checkActivationCode : function( activation_code ) {

                var dfd = $q.defer();

                $http.post( '/activate', { activation_code : activation_code }) .then( function( response ) {
                    if( response.data.success ) {
                        $window.localStorage.removeItem( 'activation_token' );
                        $window.localStorage.removeItem( 'activation_email' );
                        initSession( response.data );
                        dfd.resolve( response.data );
                    }
                    else {
                        dfd.resolve( response.data );
                    }
                }, function ( rejection ) {
                    dfd.resolve( rejection.data );
                });

                return dfd.promise;
            },


        };

    }]);
