/*
 * bbNaEnModalSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.factory('bbNaEnModalSvc', [ '$modal', function( $modal ) {
    return {
        naEnModalInstance : undefined,
        naEnModal         : function() {
            var 
                naEnModal = $modal.open({
                    templateUrl : '/app/main/na-en-modal.html',
                    windowClass: "modal-na",
                    controller  : [
                        '$scope',
                        function( $scope ) {
                        }] 
                });
            this.naEnModalInstance = naEnModal;
            return naEnModal;
        }
    };
}]);
