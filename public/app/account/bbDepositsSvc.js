/*
 * bbDepositsSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp */

'use strict';

bbApp.factory('bbDepositsSvc', function() {

    return {
        depositMode : "transfer",
        bankMode    :  undefined
    };
});
