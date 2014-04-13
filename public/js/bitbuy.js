/*
 * bitbuy.js
 * Root namespace module
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global $ */ 

var bitbuy = (function () {
    'use strict';
    var initModule = function ( $container ) {
        bitbuy.ticker.initModule( $('#price-group') );
    };

    return { initModule : initModule };
}());
