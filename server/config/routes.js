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
var 
    auth     = require( './auth' ),
    mongoose = require('mongoose'),
    User     = mongoose.model( 'User' );
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( app, config ) {

    app.post( '/login', function( req, res, next ) {
        auth.authenticate( req, res, next, config );
    });

    app.post( '/logout', function( req, res ) {
        User.invalidateUserAccessToken( req.body.username, function() {
             res.end();
        });
    });

    app.get( '*', function( req, res ) { res.render( 'index' ); });
};
