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
    auth     = require( '../../server/config/auth' ),
    user_ip,
    getClientIp, toProperCase;
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
            return doc.toJSON({ getters : true });
        }));
        res.end();
    });

};

exports.createUser = function( req, res, next ) {

    var
        user, confirmationUrl
        ;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    user                 = new User( req.body );

    user.username        = user.username.toLowerCase();
    user.firstName       = toProperCase( user.firstName );
    user.lastName        = toProperCase( user.lastName );
    user.ip              = ip.toLong( getClientIp( req ) );
    user.activation_code = Math.floor( Math.random()*90000 ) + 10000;

    user.save( function( err ) {
        if ( err ) {
            if ( err.toString().indexOf( 'E11000' ) > -1 ) {
                err = new Error( 'Duplicate e-mail' );
            }
            res.status( 400 );
            return res.send({ reason : err.toString() });
        }
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
                // SEND EMAIL 
                confirmationUrl = req.protocol + "://" + req.get('host') + "/confirm/" + confirmation_token;
                res.send( access_token + ' ' + confirmationUrl );
            });
        });
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
            user.confirmation_token = null;
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
}
