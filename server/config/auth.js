/*
 * auth.js
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
    passport    = require( 'passport' ),
    mongoose    = require( 'mongoose' ),
    User        = mongoose.model( 'User' ),
    AccessToken = mongoose.model( 'AccessToken' );
//----------------- END MODULE SCOPE VARIABLES -------------------

exports.authenticate = function( req, res, next, config ) {
    if ( req.body.auth_type === 'access_token'  ) {
        var
        utils = require( './utils' )( config ),
        parts, scheme, credentials,
        access_token, decoded
        ;

        if ( req.headers && req.headers.authorization ) {
            parts = req.headers.authorization.split( ' ' );
            if ( parts.length === 2 ) {
                scheme      = parts[0];
                credentials = parts[1];

                if ( /^Bearer$/i.test( scheme ) ) {
                    access_token = credentials;
                    decoded      = utils.jwtDecode( access_token );

                    //Now do a lookup on that email in mongodb ... if exists it's a real user
                    if ( decoded && decoded.username && decoded.date_created ) {
                        User.findUser( decoded.username, access_token, function( err, user ) {
                            if ( err ) {
                                console.log( err );
                                return next( res.send({ error: 'Issue finding user.' }) );
                            }
                            if ( user ) {
                                if ( +(new Date(decoded.date_created)) !== +user.access_token.date_created ) {
                                    return next( res.send({ error: 'Token date mismatch. Potential theft.' }) );
                                }
                                if ( ! AccessToken.hasExpired( user.access_token.date_created, user.token_exp ) ) {
                                    User.createUserAccessToken( user.username, function( err, access_token ) {
                                        if ( err ) { return next( res.send({ error : err }) ); }
                                        return next( res.send({
                                            success : true,
                                            user    : {
                                                username     : user.username,
                                                firstName    : user.firstName,
                                                lastName     : user.lastName,
                                                euroBalance  : user.euroBalance,
                                                btcBalance   : user.btcBalance,
                                                access_token : access_token,
                                                token_exp    : user.token_exp
                                            }
                                        }) );
                                    });
                                }
                                else {
                                    return next( res.send({ error: 'Token expired. Please log in again.'  }) );
                                }
                            }
                        });
                    }
                    else {
                        console.log('Whoa! Couldn\'t even decode incoming token!');
                        return next( res.send({ error: 'Issue decoding incoming token.' }) );
                    }
                }
            }
        }
    }
    else {
        var auth = passport.authenticate( 'local', { session: false }, function( err, user ) {
            if ( err ) { return next( err ); }
            if ( !user ) { return next( res.send({ success : false }) ); }
            User.createUserAccessToken( user.username, function( err, access_token ) {
                if ( err ) { return next( err ); }
                return next( res.send({
                    success : true,
                    user    : {
                        username     : user.username,
                        firstName    : user.firstName,
                        lastName     : user.lastName,
                        euroBalance  : user.euroBalance,
                        btcBalance   : user.btcBalance,
                        access_token : access_token,
                        token_exp    : user.token_exp
                    }
                }) );
            });
        });
        auth( req, res, next );
    }
};
