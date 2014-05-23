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
    users    = require( '../../app/controllers/users' ),
    mongoose = require('mongoose');
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( app, config ) {

    app.get( '/api/users', auth.requiresRole( 'admin', config ), users.getUsers );

    app.post( '/api/users', function( req, res, next ) {
        users.createUser( req, res, next, config )
    });

    app.post( '/login', function( req, res, next ) {
        auth.authenticate( req, res, next, config, true, auth.loginCallback );
    });

    app.post( '/activate', function( req, res, next ) {
        users.checkActivationCode( req, res, next, config );
    });

    app.post( '/resend', function( req, res, next ) {
        users.resendActivationEmail( req, res, next, config );
    });

    app.post( '/logout', function( req, res, next ) { 
        auth.authenticate( req, res, next, config, false, auth.logoutCallback );
    });

    app.get( "/confirm_email/:confirmation_token", users.checkConfirmationToken );

    app.get( '*', function( req, res ) { res.render( 'index' ); });
};
