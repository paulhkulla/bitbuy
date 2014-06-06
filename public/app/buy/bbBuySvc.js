/*
 * bbBuySvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp */

'use strict';

bbApp.factory('bbBuySvc', function() {

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

                console.log(totalFee);
                return totalFee;
        },
        calculateReceiveAmount = function( depositAmount, depositFee ) {
            return depositAmount - depositFee;
        };

    return {
        inputMode              : "btc",
        depositMode            : "transfer",
        isChangeDepositAmount  : false,
        btcInputtedAmount      : undefined,
        euroDepositAmount      : undefined,
        euroDepositFee         : undefined,
        euroReceiveAmount      : undefined,
        calculateFee           : calculateFee,
        calculateReceiveAmount : calculateReceiveAmount
    };
});
