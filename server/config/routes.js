/*
 * routes.js
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
        auth.authenticate( req, res, next, config, function ( result ) {
            if ( ! result.responseHeader ) {
                res.send( result );
            }
            else {
                res.statusCode = result.responseStatusCode;
                if ( result.responseHeader ) {
                    res.setHeader( result.responseHeader.attribute, result.responseHeader.value );
                }
            }
            res.end();
        });
    });

    app.post( '/logout', function( req, res, next ) {
        auth.authenticate( req, res, next, config, function ( result ) {
            if ( result.success ) {
                User.invalidateUserAccessToken( result.user.username, function() {
                    res.end();
                });
            }
            else {
                res.end();
            }
        });
    });

    app.get( '*', function( req, res ) { res.render( 'index' ); });
};
