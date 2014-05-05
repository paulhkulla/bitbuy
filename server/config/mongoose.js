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
    mongoose = require( 'mongoose' ),
    bcrypt   = require('bcrypt'),
    SALT_WORK_FACTOR = 10,

    db
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( config ) {
    var 
        UserSchema,
        User;

    mongoose.connect( config.db );
    db = mongoose.connection;
    db.on( 'error', console.error.bind( console, 'db connection error') );
    db.once( 'open', function() { console.log( 'db connection established' ); } );

    UserSchema = mongoose.Schema({
        firstName   : String,
        lastName    : String,
        euroBalance : Number,
        btcBalance  : Number,
        username    : String,
        password    : String
    });

    UserSchema.pre( 'save', function( next ) {
        var user = this;

        // only hash the password if it has been modified (or is new)
        if ( !user.isModified('password') ) { return next(); }

        // generate a salt
        bcrypt.genSalt( SALT_WORK_FACTOR, function( err, salt ) {
            if ( err ) { return next( err ); }

            // hash the password along with our new salt
            bcrypt.hash( user.password, salt, function( err, hash ) {
                if ( err ) { return next( err ); }

                // override the cleartext password with the hashed one
                user.password = hash;
                next();
            });
        });
    });

    UserSchema.methods.comparePassword = function( candidatePassword, callback ) {
        bcrypt.compare( candidatePassword, this.password, function( err, isMatch ) {
            if ( err ) { return callback( err ); }
            callback( null, isMatch );
        });
    };

    User = mongoose.model( 'User', UserSchema );

    User.find({}).exec(function( err, collection ) {
        if ( collection.length === 0 ) {
            User.create({ firstName: 'Joe', lastName: 'Eames', euroBalance: 9534, btcBalance: 100.34522, username: 'joe', password: 'joe' });
            User.create({ firstName: 'Markus', lastName: 'Pint', euroBalance: 10232.99, btcBalance: 1, username: 'markuspint@hotmail.com', password: 'kokaiin' });
        }
    });

};
