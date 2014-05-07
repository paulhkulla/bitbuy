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
    bcrypt      = require('bcrypt'),
    jwt         = require('jwt-simple'),
    tokenSecret = 'never stop dreaming',
    AccessToken       = require('mongoose').model('AccessToken'),

    SALT_WORK_FACTOR = 10,
    UserSchema, User
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( config ) {

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

    UserSchema.pre( 'save', function( next ) {
        var user = this;

        // only hash the password if it has been modified (or is new)
        if ( user.isModified('password') ) { 
            // generate a salt
            bcrypt.genSalt( SALT_WORK_FACTOR, function( err, salt ) {
                if ( err ) { return next( err ); }

                // hash the password along with our new salt
                bcrypt.hash( user.password, salt, function( err, hash ) {
                    if ( err ) { return next( err ); }

                    // override the cleartext password with the hashed one
                    user.password = hash;
                });
            });
        }
        next();
    });

    UserSchema.methods.comparePassword = function( candidatePassword, callback ) {
        bcrypt.compare( candidatePassword, this.password, function( err, isMatch ) {
            if ( err ) { return callback( err ); }
            callback( null, isMatch );
        });
    };

    UserSchema.statics.encode = function( data ) {
        return jwt.encode(data, tokenSecret);
    };

    UserSchema.statics.decode = function( data ) {
        return jwt.decode(data, tokenSecret);
    };

    UserSchema.statics.findUser = function( username, access_token, cb ) {
        this.findOne({ username : username }, function( err, user ) {
            if ( err ) { return cb( err, null ); }
            if ( !user ) { return cb( 'User mismatch', null ); }
            if ( user.access_token && user.access_token.token ) {
                bcrypt.compare( access_token, user.access_token.token, function( err, isMatch ) {
                    if ( err ) { return cb( err, null ); }
                    if ( isMatch ) { cb( false, user ); }
                    else {
                        cb(new Error('Supplied token does not exist or does not match.'), null);
                    }
                });
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
            self = this,
            now, access_token;

        this.findOne({ username : username }, function( err, user ) {
            if(err || !user) {
                console.log('err');
            }
            //Create a token and add to user and save
            
            now = new Date().getTime();
            access_token = self.encode({ username : username, date_created : now });
            bcrypt.genSalt( SALT_WORK_FACTOR, function( err, salt ) {
                if ( err ) { return cb( err,null ); }

                // hash the access_token along with our new salt
                bcrypt.hash( access_token, salt, function( err, hash ) {
                    if ( err ) { return cb( err,null ); }

                    user.access_token = new AccessToken({ token : hash, date_created : now });
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
        });
    };

    UserSchema.statics.invalidateUserAccessToken = function( username, cb ) {
        this.findOne( { username : username }, function( err, user ) {
            if( err || !user ) {
                console.log( 'err' );
            }
            user.token = null;
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
                user.reset_token = require( 'crypto' ).randomBytes( 32 ).toString( 'hex' );
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
            User.create({ firstName: 'Joe', lastName: 'Eames', euroBalance: 9534, btcBalance: 100.34522, username: 'joe', password: 'joe' });
            User.create({ firstName: 'Markus', lastName: 'Pint', euroBalance: 10232.99, btcBalance: 1, username: 'markuspint@hotmail.com', password: 'kokaiin' });
        }
    });

};
