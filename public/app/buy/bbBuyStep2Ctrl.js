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
    function( $scope, $state, bbBtcPriceSvc, bbBuySvc, bbIdentitySvc ) {

        var
            calculateFee = function( depositAmount, mode ) {
                var 
                depositAmountInCents = depositAmount * 100,

                bankLinkCommission,
                bankLinkPercentage   = 0.01,
                bankLinkMin          = 13,

                additionalCommission,
                additionalPercentage = 0.023,
                additionalMax        = 440,
                additionalFixedPrice = 18,

                totalFee
                ;

                if ( mode === 'transfer' || ! depositAmountInCents ) { return 0; }

                bankLinkCommission   = depositAmountInCents * bankLinkPercentage;
                bankLinkCommission   = bankLinkCommission <= bankLinkMin ? bankLinkMin : bankLinkCommission;

                additionalCommission = depositAmountInCents * additionalPercentage;
                additionalCommission = additionalCommission >= additionalMax ? additionalMax : additionalCommission;
                additionalCommission = additionalCommission + additionalFixedPrice;

                totalFee             = ( ( bankLinkCommission + additionalCommission ) / 100 ).toFixed( 2 );

                return totalFee;
        },
        calculateReceiveAmount = function( depositAmount, depositFee ) {
            return depositAmount - depositFee;
        };

        bbBuySvc.euroDepositFee    = calculateFee( bbBuySvc.euroDepositAmount, bbBuySvc.depositMode );
        bbBuySvc.euroReceiveAmount = calculateReceiveAmount( bbBuySvc.euroDepositAmount, bbBuySvc.euroDepositFee );

        $scope.bbBtcPriceSvc       = bbBtcPriceSvc;
        $scope.bbBuySvc            = bbBuySvc;

        $scope.updateBtcAmount = function() {
            bbBuySvc.inputtedBtcAmount = bbBuySvc.euroDepositAmount ? ( bbBuySvc.euroDepositAmount / bbBtcPriceSvc.currentPrice ).toFixed( 8 ) : 0;
            bbBuySvc.euroDepositFee    = calculateFee( bbBuySvc.euroDepositAmount, bbBuySvc.depositMode );
            bbBuySvc.euroReceiveAmount = calculateReceiveAmount( bbBuySvc.euroDepositAmount, bbBuySvc.euroDepositFee );
        };
        $scope.toggleDepositAmountChange = function() {
            bbBuySvc.isChangeDepositAmount = bbBuySvc.isChangeDepositAmount ? false : true;
        };
        $scope.changeDepositMode = function( mode ) {
            bbBuySvc.depositMode       = mode;
            bbBuySvc.euroDepositFee    = calculateFee( bbBuySvc.euroDepositAmount, bbBuySvc.depositMode );
            bbBuySvc.euroReceiveAmount = calculateReceiveAmount( bbBuySvc.euroDepositAmount, bbBuySvc.euroDepositFee );
        };
        $scope.submitDeposit = function( depositAmount ) {
            depositAmount = parseFloat( depositAmount );
            if ( bbIdentitySvc.currentUser ) {
                bbIdentitySvc.currentUser.euroBalance = bbIdentitySvc.currentUser.euroBalance + depositAmount;
            }
            $state.go( 'buy.step-3' );
        };
}]);
