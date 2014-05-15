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
    AccessToken = mongoose.model( 'AccessToken' ),

    genResObj;
//----------------- END MODULE SCOPE VARIABLES -------------------
genResObj = function( success, tokenAndUser, statusCode, attribute, value ) {
    var obj = {};

    if ( ! success && ! tokenAndUser ) {
        obj.responseHeader = {};
    }

    if ( success ) { obj.success = success; }
    if ( tokenAndUser ) {
        obj.user = {
            username     : tokenAndUser.user.username,
            firstName    : tokenAndUser.user.firstName,
            lastName     : tokenAndUser.user.lastName,
            euroBalance  : tokenAndUser.user.euroBalance,
            btcBalance   : tokenAndUser.user.btcBalance,
            access_token : tokenAndUser.access_token,
            token_exp    : tokenAndUser.user.token_exp
        };
    }
    if ( statusCode ) { obj.responseStatusCode = statusCode; }
    if ( attribute ) { obj.responseHeader.attribute = attribute; }
    if ( value ) { obj.responseHeader.value = value; }

    return obj;
};

exports.authenticate = function( req, res, next, config, callback ) {
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
                    try { 
                        decoded = utils.jwtDecode( access_token );
                    }
                    catch ( err ) {
                        return callback( genResObj( false, null, 401, 'WWW-Authenticate',
                            'Bearer, error="invalid_token",'
                            + ' error_description="Malformed access token"' ) );
                    }

                    //Now do a lookup on that email in mongodb ... if exists it's a real user
                    if ( decoded && decoded.username && decoded.date_created ) {
                        User.findUser( decoded.username, access_token, function( err, user ) {
                            if ( err ) {
                                return callback( genResObj( false, null, 401, 'WWW-Authenticate', 'Bearer' ) );
                            }
                            if ( user ) {
                                if ( +(new Date(decoded.date_created)) !== +user.access_token.date_created ) {
                                    return callback( genResObj( false, null, 401, 'WWW-Authenticate',
                                        'Bearer, error="invalid_token",'
                                    + ' error_description="Access token date mismatch. Potential theft. Change your password."' ) );
                                }
                                if ( ! AccessToken.hasExpired( user.access_token.date_created, user.token_exp ) ) {
                                    User.createUserAccessToken( user.username, function( err, access_token ) {
                                        if ( err ) {
                                            return callback( genResObj( false, null, 500, 'error', 'server_error' ) );
                                        }
                                        return callback( genResObj( true, { user : user, access_token : access_token } ) );
                                    });
                                }
                                else {
                                    return callback( genResObj( false, null, 401, 'WWW-Authenticate',
                                        'Bearer, error="invalid_token",'
                                    + ' error_description="The access token expired"' ) );
                                }
                            }
                        });
                    }
                    else {
                        return callback( genResObj( false, null, 401, 'WWW-Authenticate',
                            'Bearer, error="invalid_token",'
                            + ' error_description="Incomplete access token"' ) );
                    }
                }
            }
        }
        else {
            return callback( genResObj( false, null, 401, 'WWW-Authenticate', 'Bearer' ) );
        }
    }
    else {
        var auth = passport.authenticate( 'local', { session: false }, function( err, user ) {
            if ( err ) {
                return callback( genResObj( false, null, 500, 'error', 'server_error' ) );
            }
            if ( ! user ) {
                return callback( { success : false, user : null  } );
            }
            User.createUserAccessToken( user.username, function( err, access_token ) {
                if ( err ) {
                    return callback({
                        success            : false,
                        responseStatusCode : 500,
                        responseHeader     : {
                            attribute : 'error',
                            value     : 'server_error'
                        }
                    });
                }
                return callback( genResObj( true, { user : user, access_token : access_token } ) );
            });
        });
        auth( req, res, next );
    }
};
