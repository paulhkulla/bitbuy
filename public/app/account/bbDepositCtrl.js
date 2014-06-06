/*
 * bbDepositCtrl.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp */

'use strict';

bbApp.controller('bbDepositCtrl', [
    '$scope',
    'bbDepositsSvc',
    'bbBuySvc',
    function( $scope, bbDepositsSvc, bbBuySvc ) {
        var
            calculateFee           = bbBuySvc.calculateFee,
            calculateReceiveAmount = bbBuySvc.calculateReceiveAmount;

        $scope.bbDepositsSvc = bbDepositsSvc;
        $scope.bbBuySvc      = bbBuySvc;

        bbBuySvc.euroDepositFee    = calculateFee( bbBuySvc.euroDepositAmount, bbDepositsSvc.depositMode );
        bbBuySvc.euroReceiveAmount = calculateReceiveAmount( bbBuySvc.euroDepositAmount, bbBuySvc.euroDepositFee );

        $scope.changeBankMode = function( mode ) {
            bbDepositsSvc.bankMode  = mode;
        };
        $scope.changeDepositMode = function( mode ) {
            bbDepositsSvc.depositMode  = mode;
            bbBuySvc.euroDepositFee    = calculateFee( bbBuySvc.euroDepositAmount, mode );
            bbBuySvc.euroReceiveAmount = calculateReceiveAmount( bbBuySvc.euroDepositAmount, bbBuySvc.euroDepositFee );
        };
}]);
