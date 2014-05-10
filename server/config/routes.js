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

module.exports = function( app, config ) {

    app.get( '/login', function( req, res, next ) {
        auth.authenticateGet( req, res, next, config );
    });

    app.post( '/login', auth.authenticatePost );

    app.get( '*', function( req, res ) { res.render( 'index' ); });
};
