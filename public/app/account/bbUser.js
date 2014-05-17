/*
 * bbUser.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.factory( 'bbUser', [ '$resource', function( $resource ) {
    var UserResource = $resource( '/api/users/:id', { _id: "@id" } );

    UserResource.prototype.isAdmin = function() {
        return this.roles && this.roles.indexOf( 'admin' ) > -1;
    };
    
    return UserResource;
}]);
