/*
 * bbLockedModalSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.factory('bbLockedModalSvc', [ '$modal', function( $modal ) {
    return {
        lockedModalInstance : undefined,
        lockedModal       : function() {
            var 
                that         = this,
                lockedModal = $modal.open({
                    templateUrl : '/app/account/locked-modal.html',
                    windowClass: "modal-locked",
                    backdrop: 'static',
                    controller  : [
                        '$scope',
                        'bbIdentitySvc', 
                        'bbAuthSvc',
                        'bbLoginSvc',
                        function( $scope, bbIdentitySvc, bbAuthSvc, bbLoginSvc ) {
                            $scope.warningModalSvcObj    = that;
                            $scope.identity              = bbIdentitySvc;

                            $scope.signin                = bbLoginSvc.signin;
                            $scope.password              = bbLoginSvc.password;
                            $scope.isLoginButtonDisabled = bbLoginSvc.isLoginButtonDisabled;

                            $scope.logoutUser            = bbAuthSvc.logoutUser;
                        }] 
                });
            this.lockedModalInstance = lockedModal;
            return lockedModal;
        }
    };
}]);
