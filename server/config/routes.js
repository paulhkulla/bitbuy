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
    auth        = require( './auth' ),
    mongoose    = require( 'mongoose' ),
    User        = mongoose.model( 'User' ),
    AccessToken = mongoose.model( 'AccessToken' );
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( app ) {

    app.get( '/login', function( req, res ) { 

        var
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
                    decoded      = AccessToken.decode(access_token);

                    //Now do a lookup on that email in mongodb ... if exists it's a real user
                    if ( decoded && decoded.username && decoded.date_created ) {
                        User.findUser( decoded.username, access_token, function( err, user ) {
                            if ( err ) {
                                console.log( err );
                                res.send({ error: 'Issue finding user.' });
                            }
                            if ( user ) {
                                if ( +(new Date(decoded.date_created)) !== +user.access_token.date_created ) {
                                    res.send({ error: 'Token date mismatch. Potential theft.' });
                                }
                                if ( ! AccessToken.hasExpired( user.access_token.date_created, user.token_exp ) ) {
                                    User.createUserAccessToken( user.username, function( err, access_token ) {
                                        if ( err ) { return res.send({ error : err }); }
                                        res.send({
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
                                        });
                                    });
                                }
                                else {
                                    res.send({ error: 'Token expired. Please log in again.'  });
                                }
                            }
                        });
                    }
                    else {
                        console.log('Whoa! Couldn\'t even decode incoming token!');
                        res.send({ error: 'Issue decoding incoming token.' });
                    }
                }
            }
        }
    });

    app.post( '/login', auth.authenticate);

    app.get( '*', function( req, res ) { 
        res.render( 'index' );
    });
};
