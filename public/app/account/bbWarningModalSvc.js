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
        countdown            : undefined,
        countdownHumanized   : undefined,
        token_exp            : undefined,
        warningModalInstance : undefined,
        warningModal         : function() {
            var 
                that         = this,
                warningModal = $modal.open({
                    size        : 'sm',
                    templateUrl : '/app/account/warning-modal.html',
                    windowClass : 'modal-idle',
                    controller  : [
                        '$scope',
                        'bbLogoutSvc', 
                        function( $scope, bbLogoutSvc ) {
                            $scope.warningModalSvcObj = that;
                            $scope.signout = bbLogoutSvc.signout;
                        }] 
                });
            this.warningModalInstance = warningModal;
            return warningModal;
        }
    };
}]);
