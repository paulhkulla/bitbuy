/*
 * bbWarningModalSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.factory('bbWarningModalSvc', [ '$modal', function( $modal ) {
    return {
        countdown          : undefined,
        countdownHumanized : undefined,
        token_exp          : undefined,
        warningModal       : function() {
            var 
                that         = this,
                warningModal = $modal.open({
                    templateUrl : '/app/account/warning-modal.html',
                    controller  : [
                        '$scope',
                        'bbAuthSvc', 
                        function( $scope, bbAuthSvc ) {
                            // console.log(warningModal);
                            $scope.warningModalSvcObj = that;
                            $scope.logoutUser = bbAuthSvc.logoutUser;
                        }] 
                });
            return warningModal;
        }
    };
}]);
