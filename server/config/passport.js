/*
 * passort.js - setup serialize / deserialize user and
 *  initialize localstrategy
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*jslint node:true */

'use strict';

//---------------- BEGIN MODULE SCOPE VARIABLES ------------------
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function ( config ) {
    require( './local-strategy' )( config );
};
