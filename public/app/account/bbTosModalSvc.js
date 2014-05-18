/*
 * bbTosModalSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.factory('bbTosModalSvc', [ '$modal', function( $modal ) {
    return {
        tosModalInstance : undefined,
        tosModal         : function() {
            var 
                tosModal = $modal.open({
                    templateUrl : '/app/account/tos-modal.html',
                    windowClass: "modal-tos",
                    controller  : [
                        '$scope',
                        function( $scope ) {
                        }] 
                });
            this.tosModalInstance = tosModal;
            return tosModal;
        }
    };
}]);
