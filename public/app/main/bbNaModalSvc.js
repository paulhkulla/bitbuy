/*
 * bbNaModalSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.factory('bbNaModalSvc', [ '$modal', function( $modal ) {
    return {
        naModalInstance : undefined,
        naModal         : function() {
            var 
                naModal = $modal.open({
                    templateUrl : '/app/main/na-modal.html',
                    windowClass: "modal-na",
                    controller  : [
                        '$scope',
                        function( $scope ) {
                        }] 
                });
            this.naModalInstance = naModal;
            return naModal;
        }
    };
}]);
