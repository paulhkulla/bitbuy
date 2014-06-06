/*
 * users.js - users controller
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
    mongoose = require( 'mongoose' ),
    ip       = require( 'ip' ),
    User     = mongoose.model( 'User' ),
    Token    = mongoose.model( 'Token' ),
    auth     = require( '../../server/config/auth' ),
    user_ip,
    getClientIp, toProperCase,
    mandrill
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------
getClientIp = function ( req ) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] 
    || req.connection.remoteAddress;
};

toProperCase = function ( str ) {
    return str.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

exports.getUsers = function( req, res ) {

    User.find({}).exec( function( err, collection ) {
        res.send( collection.map( function(doc) {
            doc.ip[0] = ip.fromLong( doc.ip[0] );
            return doc.toJSON({ getters : true });
        }));
        res.end();
    });

};

exports.createUser = function( req, res, next, config ) {

    var
        user, confirmationUrl,
        clientName, to
        ;

    if ( ! mandrill ) {
        mandrill = require( '../../server/utils/mandrill' )( config );
    }

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    user                 = new User( req.body );

    user.username        = user.username.toLowerCase();
    user.firstName       = toProperCase( user.firstName );
    user.lastName        = toProperCase( user.lastName );
    user.ip              = ip.toLong( getClientIp( req ) );
    user.activation_code = Math.floor( Math.random()*90000 ) + 10000;
    if ( user.username === "markus@bitbuy.ee" || user.username === "admin@bitbuy.ee" ) {
        user.roles = [ 'admin', 'user' ];
    }

    user.save( function( err ) {
        if ( err ) {
            if ( err.toString().indexOf( 'E11000' ) > -1 ) {
                err = new Error( 'Duplicate e-mail' );
            }
            res.status( 400 );
            return res.send({ reason : err.toString() });
        }
        else {
            User.createUserAccessToken( user.username, function ( err, access_token ) {
                if ( err ) {
                    res.status( 400 );
                    return res.send({ reason : err.toString() });
                }
                User.createUserConfirmationToken( user.username, function ( err, confirmation_token ) {
                    if ( err ) {
                        res.status( 400 );
                        return res.send({ reason : err.toString() });
                    }
                    confirmationUrl = req.protocol + "://" + req.get('host') + "/confirm/" + confirmation_token;
                    clientName      = user.firstName + ' ' + user.lastName;
                    to              = [{
                        "email" : user.username,
                        "name"  : clientName
                    }];
                    mandrill.send( 
                        'activation',
                        'Bitbuy OÜ',
                        'teenindus@bitbuy.ee',
                        to,
                        'teenindus@bitbuy.ee',
                        'Tere tulemast Bitbuy portaali',
                        clientName,
                        user.activation_code,
                        confirmationUrl
                    );
                    res.send({ access_token : access_token });
                });
            });
        }
    });
};

exports.checkConfirmationToken = function ( req, res, next ) {
    var confirmation_token = req.params.confirmation_token;
    User.findUserByConfirmationToken( confirmation_token, function( err, user ) {
        if ( err ) {
            res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
        }
        if ( ! user ) {
            res.send({ success : false, user : null });
        }
        else {
            user.confirmation_token = undefined;
            user.activation_code    = undefined;
            user.email_activated    = true;
            user.save( function( err, user ) {
                if ( err ) {
                    res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                } else {
                    User.createUserAccessToken( user.username, function( err, access_token ) {
                        if ( err ) {
                            res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                        }
                        res.send( auth.genResObj( true, { user : user, access_token : access_token } ) );
                    });
                }
            });
        }
    });
};

exports.checkActivationCode = function ( req, res, next, config ) {
    var 
        parts, scheme,
        access_token, decoded,
        activation_code = req.body.activation_code,
        utils           = require( '../../server/utils/utils' )( config );

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
                    res.send( auth.genResObj( false, null, 401, 'WWW-Authenticate',
                        'Bearer, error="invalid_token",'
                    + ' error_description="Malformed access token"' ) );
                }

                // Now do a lookup on that email in mongodb ... if exists it's a real user
                if ( decoded && decoded.username && decoded.date_created ) {
                    User.findUser( decoded.username, access_token, function( err, user ) {
                        if ( err ) {
                            res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                        }
                        if ( user ) {
                            if ( user.activation_code === activation_code ) {
                                user.confirmation_token = undefined;
                                user.activation_code    = undefined;
                                user.email_activated    = true;
                                user.save( function( err, user ) {
                                    if ( err ) {
                                        res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                                    } else {
                                        User.createUserAccessToken( user.username, function( err, access_token ) {
                                            if ( err ) {
                                                res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                                            }
                                            res.send( auth.genResObj( true, { user : user, access_token : access_token } ) );
                                        });
                                    }
                                });
                            }
                            else {
                                res.send( { success : false, user : null  } );
                            }
                        }
                        else {
                            res.send( { success : false, user : null  } );
                        }
                    });
                }
                else {
                    res.send( auth.genResObj( false, null, 401, 'WWW-Authenticate',
                        'Bearer, error="invalid_token",'
                    + ' error_description="Incomplete access token"' ) );
                }
            }
            else {
                res.send( auth.genResObj( false, null, 401, 'WWW-Authenticate',
                    'Bearer, error="invalid_token",'
                + ' error_description="Invalid authorization header"' ) );
            }
        }
        else {
            res.send( auth.genResObj( false, null, 401, 'WWW-Authenticate',
                'Bearer, error="invalid_token",'
            + ' error_description="Invalid authorization header"' ) );

        }
    }
    else {
        res.send( auth.genResObj( false, null, 401, 'WWW-Authenticate', 'Bearer' ) );
    }

};

exports.resendActivationEmail = function( req, res, next, config ) {

    var
        confirmationUrl, clientName, to
        ;

    if ( ! mandrill ) {
        mandrill = require( '../../server/utils/mandrill' )( config );
    }

    User.findUserByEmailOnly( req.body.email, function( err, user ) {
        if ( err ) {
            res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
        }
        if ( user ) {
            confirmationUrl = req.protocol + "://" + req.get('host') + "/confirm/" + user.confirmation_token.token;
            clientName      = user.firstName + ' ' + user.lastName;
            to              = [{
                "email" : user.username,
                "name"  : clientName
            }];
            mandrill.send( 
                'activation',
                'Bitbuy OÜ',
                'teenindus@bitbuy.ee',
                to,
                'teenindus@bitbuy.ee',
                'Tere tulemast Bitbuy portaali',
                clientName,
                user.activation_code,
                confirmationUrl
            );
            res.send( { success : true, user : null } )
        }
        else {
            res.send( { success : false, user : null  } );
        }
    });
};

exports.sendResetEmail = function( req, res, next, config ) {

    var
    confirmationUrl, clientName, to
    ;

    if ( ! mandrill ) {
        mandrill = require( '../../server/utils/mandrill' )( config );
    }

    User.findUserByEmailOnly( req.body.email, function( err, user ) {
        if ( err ) {
            res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
        }
        if ( user ) {

            user.reset_confirmation_code = Math.floor( Math.random()*90000 ) + 10000;
            user.save( function( err ) {
                if ( err ) {
                    res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                }
                else {
                    User.createUserResetToken( user.username, function ( err, reset_token ) {
                        if ( err ) {
                            res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                        }
                        confirmationUrl = req.protocol + "://" + req.get('host') + "/confirm_reset/" + reset_token;
                        clientName      = user.firstName + ' ' + user.lastName;
                        to              = [{
                            "email" : user.username,
                            "name"  : clientName
                        }];
                        mandrill.send( 
                            'reset',
                            'Bitbuy OÜ',
                            'teenindus@bitbuy.ee',
                            to,
                            'teenindus@bitbuy.ee',
                            'Parooli muutmine',
                            clientName,
                            user.reset_confirmation_code,
                            confirmationUrl
                        );
                        res.send({ success : true });
                    });
                }
            });
        }
        else {
            res.send( { success : false  } );
        }
    });
};

exports.checkResetToken = function ( req, res, next ) {
    var
        updates,
        reset_token = req.params.reset_token;
    User.findUserByResetToken( reset_token, function( err, user ) {
        if ( err ) {
            res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
        }
        if ( ! user ) {
            res.send({ success : false, reason : "email not found" });
        }
        else {
            if ( ! Token.hasExpired( user.reset_token.date_created, user.reset_token_exp ) ) {
                updates = { $set: { reset_attempts: 0 } };
                user.update( updates, function( err ) {
                    if ( err ) {
                        res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                    }
                    else {
                        User.createUserResetAccessToken( user.username, function ( err, reset_access_token ) {
                            if ( err ) {
                                res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                            }
                            res.send({ success : true, reset_access_token : reset_access_token, email : user.username });
                        });
                    }
                });
            }
            else {
                res.send({ success : false, reason : "expired" });
            }
        }
    });
};

exports.checkResetConfirmationCode = function ( req, res, next ) {
    var
        updates,
        email = req.body.email,
        confirmation_code = req.body.confirmation_code;

    User.findUserByEmailOnly( email, function( err, user ) {
        if ( err ) {
            res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
        }
        if ( ! user ) {
            res.send({ success : false, reason : "email not found" });
        }
        else {
            if ( ! Token.hasExpired( user.reset_token.date_created, user.reset_token_exp ) ) {
                if ( user.reset_attempts >= 3 ) {
                    res.send({ success : false, reason : "attempts exceeded" });
                }
                else {
                    updates = { $inc: { reset_attempts: 1 } };
                    user.update( updates, function( err ) {
                        if ( err ) {
                            res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                        }
                        else {
                            if ( user.reset_confirmation_code === confirmation_code ) {
                                updates = { $set: { reset_attempts: 0 } };
                                user.update( updates, function( err ) {
                                    if ( err ) {
                                        res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                                    }
                                    else {
                                        User.createUserResetAccessToken( user.username, function ( err, reset_access_token ) {
                                            if ( err ) {
                                                res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                                            }
                                            res.send({ success : true, reset_access_token : reset_access_token });
                                        });
                                    }
                                });
                            }
                            else {
                                res.send({ success : false, reason : "incorrect code" });
                            }
                        }
                    });
                }
            }
            else {
                res.send({ success : false, reason : "expired" });
            }
        }
    });
};

exports.changePw = function ( req, res, next, config ) {
    var 
    email              = req.body.email,
    reset_access_token = req.body.reset_access_token,
    new_password       = req.body.password;

    User.findUserByResetAccessToken( email, reset_access_token, function( err, user ) {
        if ( err ) {
            res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
        }
        if ( user ) {
            user.password                = new_password;
            user.reset_confirmation_code = undefined;
            user.reset_token             = undefined;
            user.reset_access_token      = undefined;
            user.date_updated            = new Date().getTime();
            user.save( function( err ) {
                if ( err ) {
                    res.send( auth.genResObj( false, null, 500, 'error', 'server_error') );
                }
                else {
                    res.send({ success : true });
                }
            });
        }
        else {
            res.send( { success : false  } );
        }
    });

};
