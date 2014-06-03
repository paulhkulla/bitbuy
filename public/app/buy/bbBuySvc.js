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

    return {
        inputMode             : "btc",
        depositMode           : "transfer",
        isChangeDepositAmount : false,
        btcInputtedAmount     : undefined,
        euroDepositAmount     : undefined,
        euroDepositFee        : undefined,
        euroReceiveAmount     : undefined
    };
});
