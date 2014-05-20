/*
 * bbCheckmarkFilter.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';


bbApp.filter('bbCheckmark', function() {
    return function(input) {
        return input ? '<i class="fa fa-check"></i>' : '<i class="fa fa-times"></i>';
    };
});
