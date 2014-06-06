/*
 * bbBuyStep2Ctrl.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp */

'use strict';

bbApp.controller('bbBuyStep2Ctrl', [
    '$scope',
    '$state',
    'bbBtcPriceSvc',
    'bbBuySvc',
    'bbIdentitySvc',
    'bbDepositsSvc',
    function( $scope, $state, bbBtcPriceSvc, bbBuySvc, bbIdentitySvc, bbDepositsSvc ) {

        var
            calculateFee           = bbBuySvc.calculateFee,
            calculateReceiveAmount = bbBuySvc.calculateReceiveAmount;
            
        bbBuySvc.euroDepositFee    = calculateFee( bbBuySvc.euroDepositAmount, bbDepositsSvc.depositMode );
        bbBuySvc.euroReceiveAmount = calculateReceiveAmount( bbBuySvc.euroDepositAmount, bbBuySvc.euroDepositFee );

        $scope.bbBtcPriceSvc       = bbBtcPriceSvc;
        $scope.bbBuySvc            = bbBuySvc;
        $scope.bbDepositsSvc       = bbDepositsSvc;

        $scope.updateBtcAmount     = function() {
            bbBuySvc.inputtedBtcAmount = bbBuySvc.euroDepositAmount ? ( bbBuySvc.euroDepositAmount / bbBtcPriceSvc.currentPrice ).toFixed( 8 ) : 0;
            bbBuySvc.euroDepositFee    = calculateFee( bbBuySvc.euroDepositAmount, bbDepositsSvc.depositMode );
            bbBuySvc.euroReceiveAmount = calculateReceiveAmount( bbBuySvc.euroDepositAmount, bbBuySvc.euroDepositFee );
        };
        $scope.toggleDepositAmountChange = function() {
            bbBuySvc.isChangeDepositAmount = bbBuySvc.isChangeDepositAmount ? false : true;
        };
        $scope.changeDepositMode = function( mode ) {
            bbDepositsSvc.depositMode  = mode;
            bbBuySvc.euroDepositFee    = calculateFee( bbBuySvc.euroDepositAmount, mode );
            bbBuySvc.euroReceiveAmount = calculateReceiveAmount( bbBuySvc.euroDepositAmount, bbBuySvc.euroDepositFee );
        };
        $scope.submitDeposit = function( depositAmount ) {
            depositAmount = parseFloat( depositAmount );
            if ( bbIdentitySvc.currentUser ) {
                bbIdentitySvc.currentUser.euroBalance = bbIdentitySvc.currentUser.euroBalance + depositAmount;
            }
            $state.go( 'account.deposit' );
        };
}]);
