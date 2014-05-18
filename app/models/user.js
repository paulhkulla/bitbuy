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
    zxcvbn      = require( 'zxcvbn2' ),
    encrypt     = require( 'mongoose-encrypt' ),
    Schema      = mongoose.Schema,

    UserSchema, User
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( config ) {


    var 
        validatePassword, validateEmail,
        utils = require( '../../server/utils/utils' )( config );

    validatePassword = function( password ) {
        var score = zxcvbn( password );
        if ( score.score < 2 ) {
            return false;
        }
        return true;
    };

    validateEmail = function( email ) {
        var re = /^[a-z0-9!#$%&'*+=?^_`{|}~.-`']+@[a-z0-9-]+(\.[a-z0-9-]+)*$/;
        return re.test( email );
    };

    UserSchema = new Schema({
        username : {
            type     : String,
            trim     : true,
            default  : '',
            required : 'E-mail is required!'
        },
        password : {
            type     : String,
            default  : '',
            required : 'Password is required!',
            validate : [ validatePassword, 'Password is too simple!' ]
        },
        firstName : {
            type     : String,
            trim     : true,
            default  : '',
            required : 'First name is required!',
        },
        lastName : {
            type     : String,
            trim     : true,
            default  : '',
            required : 'Last name is required!',
        },
        birthday : {
            type : String,
            default : '',
            // required : 'Birthday is required!',
        },
        euroBalance : {
            type    : Number,
            default : 0
        },
        btcBalance : {
            type    : Number,
            default : 0
        },
        tradeLimit : {
            type    : Number,
            default : 1000
        },
        roles: {
            type: [{
                type : String,
                enum : [ 'user', 'admin' ]
            }],
            default : [ 'user' ]
        },
        access_token : {
            type : Object
        },
        token_exp : { 
            type    : Number,
            default : config.tokenExpires
        },
        reset_token : {
            type : Object,
        },
        reset_token_exp : { 
            type    : Number,
            default : config.resetTokenExpires
        },
        login_attempts: { 
            type: Number,
            default: 0
        },
        block_until: { 
            type: Number
        },
        date_updated : {
            type : Date
        },
        date_created : {
            type    : Date,
            default : Date.now
        }
    });

    UserSchema.virtual( 'isBlocked' ).get( function() {
        // check for a future block_until timestamp
        return !!( this.block_until && this.block_until > Date.now() );
    });

    /**
    * Hook a pre validate method to validate the email
    * as setter is interfering normally
    */
    UserSchema.pre( 'validate', function( next ) {
        if ( ! validateEmail( this.username ) ) {
            this.invalidate( 'username', 'E-mail is invalid', this.username );
        }
        next();
    });

    /**
    * Hook a pre save method to hash the password
    */
    UserSchema.pre( 'save', function( next ) {
        var user = this;
        if ( ! user.isModified( 'password' ) ) { return next(); }

        utils.hash( user.password, function( err, hashedPassword ) {
            user.password = hashedPassword;
            next();
        });
    });

    UserSchema.plugin( encrypt, {
        paths: [ 
            'firstName',
            'lastName',
            'birthday'
            ],
        password: function( date ) {
            // Return the correct password for the given date.
            // As long as you don't need to migrate to a new password, just return the current one.
            return config.encryption_secret;
        }
    });

    UserSchema.methods.incLoginAttempts = function( cb ) {
        // if we have a previous lock that has expired, restart at 1
        if ( this.block_until && this.block_until < Date.now() ) {
            return this.update({
                $set: { login_attempts: 1 },
                $unset: { block_until: 1 }
            }, cb);
        }
        // otherwise we're incrementing
        var updates = { $inc: { login_attempts: 1 } };
        // lock the account if we've reached max attempts and it's not locked already
        if ( this.login_attempts + 1 >= config.MAX_LOGIN_ATTEMPTS && ! this.isBlocked ) {
            updates.$set = { block_until: Date.now() + config.BLOCK_TIME };
        }
        return this.update( updates, cb );
    };

    UserSchema.statics.findUser = function( username, access_token, cb ) {
        this.findOne({ username : username }, function( err, user ) {
            if ( err ) { return cb( err, null ); }
            if ( ! user ) { return cb( 'User mismatch', null ); }
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

};
