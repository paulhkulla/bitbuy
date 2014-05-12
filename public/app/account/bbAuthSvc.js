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
    '$idle',
    'bbLockedModalSvc',
    function( $http, bbIdentitySvc, $q, $window, $location, $idle, bbLockedModalSvc ) {

        return {
            authenticateUser: function( username, password ) {

                var dfd = $q.defer();

                $http.post( '/login', { username : username, password : password } ).then( function( response ) {
                    if( response.data.success ) {
                        bbIdentitySvc.currentUser           = response.data.user;
                        $window.sessionStorage.currentUser  = JSON.stringify(bbIdentitySvc.currentUser);
                        bbIdentitySvc.authenticated         = true;
                        $window.sessionStorage.access_token = response.data.user.access_token;
                        $window.localStorage.removeItem( 'currentUser' );
                        $window.localStorage.removeItem( 'locked' );
                        bbIdentitySvc.locked                = false;
                        if ( bbLockedModalSvc.lockedModalInstance ) {
                            bbLockedModalSvc.lockedModalInstance.close();
                            bbLockedModalSvc.lockedModalInstance = undefined;
                        }
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
                        $window.sessionStorage.currentUser  = JSON.stringify(bbIdentitySvc.currentUser);
                        bbIdentitySvc.authenticated         = true;
                        $window.sessionStorage.access_token = response.data.user.access_token;
                        $window.localStorage.removeItem( 'currentUser' );
                        $window.localStorage.removeItem( 'locked' );
                        bbIdentitySvc.locked                = false;
                        dfd.resolve( true );
                    }
                    else {
                        dfd.resolve( false );
                    }
                });

                return dfd.promise;
            },

            logoutUser: function( method ) {
                $idle.unwatch();
                var dfd = $q.defer();

                $http.post( '/logout', { username : bbIdentitySvc.currentUser.username } ).then( function() {
                        bbIdentitySvc.authenticated = false;
                        $window.sessionStorage.removeItem( 'access_token' );
                        $window.sessionStorage.removeItem( 'currentUser' );

                        if ( ! method ) {
                            $window.localStorage.removeItem( 'currentUser' );
                            $window.localStorage.removeItem( 'locked' );
                            bbIdentitySvc.currentUser = undefined;
                            bbIdentitySvc.locked      = false;
                            $.smallBox({
                                title : "Nägemiseni!",
                                content : "<i class='fa fa-sign-out'></i> Olete edukalt välja logitud...",
                                color : "#96BF48",
                                timeout: 8000,
                                iconSmall : "fa fa-check fadeInLeft animated"
                            }); 
                            $location.path('/');
                            dfd.resolve( "logged out" );
                            if ( bbLockedModalSvc.lockedModalInstance ) {
                                bbLockedModalSvc.lockedModalInstance = undefined;
                            }
                        }
                        else {
                            bbIdentitySvc.locked             = true;
                            $window.localStorage.currentUser = JSON.stringify(bbIdentitySvc.currentUser);
                            $window.localStorage.locked      = JSON.stringify(bbIdentitySvc.locked);
                            lockedModal                      = bbLockedModalSvc.lockedModal();
                            if ( method === 'lock_manually' ) {
                                $.smallBox({
                                    title : " Konto lukustatud!",
                                    content : "<i class='fa fa-unlock'></i> Juurdepääsu taastamiseks sisestage enda parool...",
                                    color : "#96BF48",
                                    timeout: 8000,
                                    iconSmall : "fa fa-check fadeInLeft animated"
                                }); 
                            }
                            else if ( method === 'lock_automatically' ) {
                                $.smallBox({
                                    title : "<i class='fa fa-lock'></i> Konto lukustatud!",
                                    content : "<i class='fa fa-clock-o'></i> Olite üle "
                                        + humanizeDuration( bbIdentitySvc.currentUser.token_exp, "et" )
                                        + " ebaaktiivne, seega lukustasime teie konto teie turvalisuse huvides."
                                        + " Juurdepääsu taastamiseks sisestage enda parool...",
                                    color : "#3B9FF3",
                                    // timeout: 8000,
                                    iconSmall : "fa fa-shield fadeInLeft animated"
                                }); 
                            }
                            dfd.resolve( "locked" );
                        }
                });

                return dfd.promise;
            }
        };
}]);
