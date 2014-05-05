/*
 * mongoose.js
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
var auth = require( './auth' );
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( app ) {
    app.get( '*', function( req, res ) { res.render( 'index' ); });

    app.post( '/login', auth.authenticate);
};
