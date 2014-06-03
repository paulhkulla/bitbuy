/*
 * bbBuyStep1Ctrl.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp */

'use strict';

bbApp.controller('bbBuyStep1Ctrl', [
    '$scope',
    'bbBtcPriceSvc',
    'bbBuySvc',
    function( $scope, bbBtcPriceSvc, bbBuySvc ) {
        $scope.bbBtcPriceSvc     = bbBtcPriceSvc;
        $scope.bbBuySvc          = bbBuySvc;

        $scope.updateEuroAmount = function() {
            bbBuySvc.euroDepositAmount = bbBtcPriceSvc.currentPrice * bbBuySvc.inputtedBtcAmount;
        };
        $scope.updateBtcAmount = function() {
            bbBuySvc.inputtedBtcAmount = ( bbBuySvc.euroDepositAmount / bbBtcPriceSvc.currentPrice ).toFixed( 8 );
        };
        $scope.changeInputMode = function( mode ) {
            bbBuySvc.inputMode = mode;
        };
        $scope.$watch( 'bbBtcPriceSvc.currentPrice', function ( newVal ) {
            if ( bbBuySvc.inputtedBtcAmount && bbBuySvc.inputMode === 'btc' ) {
                bbBuySvc.euroDepositAmount = bbBuySvc.inputtedBtcAmount * newVal;
            }
            if ( bbBuySvc.euroDepositAmount && bbBuySvc.inputMode === 'eur' ) {
                bbBuySvc.inputtedBtcAmount = ( bbBuySvc.euroDepositAmount / newVal ).toFixed( 8 );
            }
        });
}]);
