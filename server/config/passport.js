/*
 * passport.js - setup local-strategy for passport
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
    passport      = require( 'passport' ),
    mongoose      = require('mongoose'),
    LocalStrategy = require( 'passport-local' ).Strategy,
    User          = mongoose.model( 'User' )
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( config ) {

    var utils = require( './utils' )( config );

    passport.use( new LocalStrategy(
        function( username, password, done ) {
            User.findOne( { username : username } ).exec( function( err, user ) {
                if ( user ) {
                    if ( user.isBlocked ) {
                        return user.incLoginAttempts( function( err ) {
                            if ( err ) { throw err; }
                            return done( null, false, true );
                        });
                    }
                    // check if password matches
                    utils.compareHash( password, user.password, function( err, isMatch ) {
                        if ( err ) { throw err; }
                        if ( isMatch ) { 
                            return done( null, user, false );
                        }
                        user.incLoginAttempts( function( err ) {
                            if ( err ) { throw err; }
                            return done( null, false, false );
                        });
                    } );
                }
                else {
                    return done( null, false, false );
                }
            });
        }
    ));
};
