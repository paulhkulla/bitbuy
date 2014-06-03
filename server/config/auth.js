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
    passport = require( 'passport' ),
    mongoose = require( 'mongoose' ),
    User     = mongoose.model( 'User' ),
    Token    = mongoose.model( 'Token' ),

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
            roles        : tokenAndUser.user.roles,
            token_exp    : tokenAndUser.user.token_exp
        };
    }
    if ( statusCode ) { obj.responseStatusCode = statusCode; }
    if ( attribute ) { obj.responseHeader.attribute = attribute; }
    if ( value ) { obj.responseHeader.value = value; }

    return obj;
};

exports.genResObj = genResObj;

exports.authenticate = function( req, res, next, config, generate_new_token, callback ) {
    var
        utils = require( '../utils/utils' )( config ),
        auth,
        parts, scheme,
        access_token, decoded
        ;

        if ( req.body.username ) {
            req.body.username = req.body.username.toLowerCase();
        }

        auth = passport.authenticate( 'local', { session: false }, function( err, user, info ) {
            if ( err ) {
                return callback( req, res, genResObj( false, null, 500, 'error', 'server_error' ) );
            }
            if ( ! user ) {
                return callback( req, res, { success : err, user : user, info : info } );
            }
            User.createUserAccessToken( user.username, function( err, access_token ) {
                if ( err ) {
                    return callback( req, res, genResObj( false, null, 500, 'error', 'server_error' ) );
                }
                if ( ! user.login_attempts && ! user.lock_until ) {
                    return callback( req, res, genResObj( true, { user : user, access_token : access_token } ) );
                }
                var updates = {
                    $set: { login_attempts: 0  },
                    $unset: { block_until: 1  }
                };
                return user.update( updates, function( err ) {
                    if ( err ) {
                        return callback( req, res, genResObj( false, null, 500, 'error', 'server_error' ) );
                    }
                    return callback( req, res, genResObj( true, { user : user, access_token : access_token } ) );
                });
            });
        });

    if ( req.body.auth_type === 'credentials'  ) {
        auth( req, res, next );
    }
    else {
        if ( req.headers && req.headers.authorization ) {
            parts = req.headers.authorization.split( ' ' );
            if ( parts.length === 2 ) {
                scheme       = parts[0];
                access_token = parts[1];

                if ( /^Bearer$/i.test( scheme ) ) {
                    try { 
                        decoded = utils.jwtDecode( access_token );
                    }
                    catch ( err ) {
                        return callback( req, res, genResObj( false, null, 401, 'WWW-Authenticate',
                            'Bearer, error="invalid_token",'
                        + ' error_description="Malformed access token"' ) );
                    }

                    // Now do a lookup on that email in mongodb ... if exists it's a real user
                    if ( decoded && decoded.username && decoded.date_created ) {
                        User.findUser( decoded.username, access_token, function( err, user ) {
                            if ( err ) {
                                res.send( genResObj( false, null, 500, 'error', 'server_error') );
                            }
                            if ( user ) {
                                if ( +(new Date(decoded.date_created)) !== +user.access_token.date_created ) {
                                    return callback( req, res, genResObj( false, null, 401, 'WWW-Authenticate',
                                        'Bearer, error="invalid_token",'
                                    + ' error_description="Access token date mismatch. Potential theft. Change your password."' ) );
                                }
                                if ( ! Token.hasExpired( user.access_token.date_created, user.token_exp ) ) {
                                    if ( generate_new_token ) {
                                        User.createUserAccessToken( user.username, function( err, access_token ) {
                                            if ( err ) {
                                                return callback( req, res, genResObj( false, null, 500, 'error', 'server_error' ) );
                                            }
                                            return callback( req, res, genResObj( true, { user : user, access_token : access_token } ) );
                                        });
                                    }
                                    else {
                                        return callback( req, res, genResObj( true, { user : user, access_token : access_token } ) );
                                    }
                                }
                                else {
                                    return callback( req, res, genResObj( false, null, 401, 'WWW-Authenticate',
                                        'Bearer, error="invalid_token",'
                                    + ' error_description="The access token expired"' ) );
                                }
                            }
                            else {
                                return callback( req, res, { success : false, user : null  } );
                            }
                        });
                    }
                    else {
                        return callback( req, res, genResObj( false, null, 401, 'WWW-Authenticate',
                            'Bearer, error="invalid_token",'
                        + ' error_description="Incomplete access token"' ) );
                    }
                }
                else {
                    return callback( req, res, genResObj( false, null, 401, 'WWW-Authenticate',
                        'Bearer, error="invalid_token",'
                    + ' error_description="Invalid authorization header"' ) );
                }
            }
            else {
                return callback( req, res, genResObj( false, null, 401, 'WWW-Authenticate',
                    'Bearer, error="invalid_token",'
                + ' error_description="Invalid authorization header"' ) );
            
            }
        }
        else {
            return callback( req, res, genResObj( false, null, 401, 'WWW-Authenticate', 'Bearer' ) );
        }
    }
};

exports.loginCallback = function ( req, res, result ) {
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
};

exports.logoutCallback = function ( req, res, result ) {
    if ( result.success ) {
        User.invalidateUserAccessToken( result.user.username, function() {
            res.end();
        });
    }
    else {
        res.end();
    }
};

exports.requiresApiLogin = function( config ) {
    return function( req, res, next ) {
        exports.authenticate( req, res, next, config, false, function ( req, res, result ) {
            if ( ! result.responseHeader ) {
                if ( result.success ) {
                    next( result );
                }
                else {
                    res.status( 403 );
                    res.end();
                }
            }
            else {
                res.statusCode = result.responseStatusCode;
                if ( result.responseHeader ) {
                    res.setHeader( result.responseHeader.attribute, result.responseHeader.value );
                }
                res.end();
            }
        });
    };
};

exports.requiresRole = function( role, config ) {
    return function( req, res, next ) {
        exports.authenticate( req, res, next, config, false, function ( req, res, result ) {
            if ( ! result.responseHeader ) {
                if ( result.user.roles && result.user.roles.indexOf( role ) > -1 ) {
                    req.result = result;
                    next();
                }
                else {
                    res.status( 403 );
                    res.end();
                }
            }
            else {
                res.statusCode = result.responseStatusCode;
                if ( result.responseHeader ) {
                    res.setHeader( result.responseHeader.attribute, result.responseHeader.value );
                }
                res.end();
            }
        });
    };
};

