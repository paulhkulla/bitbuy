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
    'bbIdentitySvc',
    'bbUser',
    function( $scope, bbIdentitySvc, bbUser ) {
        if ( ! bbIdentitySvc.locked ) {
            $scope.users = bbUser.query();
        }
}]);
