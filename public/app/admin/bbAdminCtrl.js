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
    'bbAuthSvc',
    function( $scope, bbIdentitySvc, bbUser, bbAuthSvc ) {
        $scope.getUsers = function() {
            var get_user_data = bbUser.query();
            get_user_data.$promise.then( function( result ) {
                $scope.users = result;
            });
        };
        $scope.resendActivationEmail = function( email ) {
            bbAuthSvc.resendActivationEmail( email ).then( function( response ) {
                if ( response.success ) {
                    $.smallBox({
                        title : "Toiming õnnestus!",
                        content : "Aktiveerimiskiri saadetud emailile <strong>" + email + "</strong>!",
                        color : "#96BF48",
                        timeout: 8000,
                        icon : "fa fa-check fadeInLeft animated"
                    });
                }
                else {
                    $.smallBox({
                        title : "Toiming ebaõnnestus!",
                        content : "Aktiveerimiskirja saatmine emailile <strong>" + email + "</strong> ebaõnnestus!",
                        color : "#c7262c",
                        timeout: 8000,
                        iconSmall : "fa fa-times shake animated"
                    });
                }
            });
            var get_user_data = bbUser.query();
            get_user_data.$promise.then( function( result ) {
                $scope.users = result;
            });
        };
        if ( ! bbIdentitySvc.locked ) {
            $scope.getUsers();
        }
}]);
