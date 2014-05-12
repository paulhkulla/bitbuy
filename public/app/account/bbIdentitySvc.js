/*
 * bbIdentitySvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp */

'use strict';

bbApp.factory('bbIdentitySvc', [ '$window', 'bbLockedModalSvc', function( $window, bbLockedModalSvc ) {
    var currentUser, locked, lockedModal;

    if ( $window.localStorage.getItem( 'locked' ) ) {
        locked = JSON.parse( $window.localStorage.getItem( 'locked' ) );
    }
    if ( $window.localStorage.getItem( 'currentUser' ) ) {
        currentUser = JSON.parse( $window.localStorage.getItem( 'currentUser' ) );
        lockedModal = bbLockedModalSvc.lockedModal();
    }
    else if ( $window.sessionStorage.getItem( 'currentUser' ) ) {
        currentUser = JSON.parse( $window.sessionStorage.getItem( 'currentUser' ) );
    }

    return {
        currentUser   : currentUser || undefined,
        authenticated : undefined,
        locked        : locked || undefined,
        isAuthenticated : function() {
            return !!this.currentUser;
        },
        isLocked : function() {
            return !!this.locked;
        }
    };
}]);
