/*
 * user-model.js
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
    mongoose    = require( 'mongoose' ),
    crypto      = require( 'crypto' ),
    AccessToken = require( 'mongoose' ).model( 'AccessToken' ),

    UserSchema, User
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( config ) {

    var utils = require( './utils' )( config );

    var UserSchema, User;

    UserSchema = mongoose.Schema({
        username        : String,
        password        : String,
        date_created    : { type: Date, default: Date.now },
        token_exp       : { type: Number, default: config.tokenExpires },
        firstName       : String,
        lastName        : String,
        euroBalance     : Number,
        btcBalance      : Number,
        access_token    : Object,
        reset_token     : String,
        reset_token_exp : Number
    });

    UserSchema.statics.findUser = function( username, access_token, cb ) {
        this.findOne({ username : username }, function( err, user ) {
            if ( err ) { return cb( err, null ); }
            if ( !user ) { return cb( 'User mismatch', null ); }
            if ( user.access_token && user.access_token.token ) {
                utils.compareHash( access_token, user.access_token.token, function( err, isMatch ) {
                    if ( err ) { return cb( err, null ); }
                    if ( isMatch ) { cb( false, user ); }
                    else {
                        cb(new Error('Supplied token does not match.'), null);
                    }
                });
            }  
            else {
                cb(new Error('Supplied token does not exist.'), null);
            }
        });
    };

    UserSchema.statics.findUserByEmailOnly = function( username, cb ) {
        this.findOne({ username : username }, function( err, user ) {
            if( err || !user ) {
                cb( err, null );
            }
            else {
                cb( false, user );
            }
        });
    };
    UserSchema.statics.createUserAccessToken = function( username, cb ) {
        var 
            now, access_token;

        this.findOne({ username : username }, function( err, user ) {
            if(err || !user) {
                console.log('err');
            }
            //Create a token and add to user and save
            
            now = new Date().getTime();
            access_token = utils.jwtEncode({ username : username, date_created : now });
            utils.hash( access_token, function( err, hashedToken ) {
                user.access_token = new AccessToken({ token : hashedToken, date_created : now });
                user.save(function( err, user ) {
                    if ( err ) {
                        cb( err, null );
                    }
                    else {
                        cb( false, access_token );
                    }
                });
            });

        });
    };

    UserSchema.statics.invalidateUserAccessToken = function( username, cb ) {
        this.findOne( { username : username }, function( err, user ) {
            if( err || !user ) {
                return cb( err, null )
            }
            user.access_token = null;
            user.save( function( err, user ) {
                if ( err ) {
                    cb( err, null );
                } else {
                    cb( false, user );
                }
            });
        });
    };

    UserSchema.statics.generateResetToken = function( email, cb ) {
        var now, expires;

        console.log( "in generateResetToken...." );
        this.findUserByEmailOnly( email, function( err, user ) {
            if ( err ) {
                cb( err, null );
            } else if ( user ) {
                //Generate reset token and URL link; also, create expiry for reset token
                user.reset_token = crypto.randomBytes( 32 ).toString( 'hex' );
                now = new Date();
                expires = new Date( now.getTime() + ( config.resetTokenExpires ) ).getTime();
                user.reset_token_exp = expires;
                user.save();
                cb( false, user );
            } else {
                //TODO: This is not really robust and we should probably return an error code or something here
                cb( new Error( 'No user with that email found.' ), null );
            }
        });
    };

    User  = mongoose.model( 'User', UserSchema );

    User.find({}).exec(function( err, collection ) {
        if ( collection.length === 0 ) {
            utils.hash( 'joe', function( err, hashedPassword ) {
                User.create({ firstName: 'Joe', lastName: 'Eames', euroBalance: 9534, btcBalance: 100.34522, username: 'joe', password: hashedPassword });
            });
            utils.hash( 'kokaiin', function( err, hashedPassword ) {
                User.create({ firstName: 'Markus', lastName: 'Pint', euroBalance: 10232.99, btcBalance: 1, username: 'markuspint@hotmail.com', password: hashedPassword });
            });
        }
    });

};
