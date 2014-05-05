/*
 * bitbuy.js - bitbuy server
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
    env           = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config        = require( './server/config/config' )[env],

    express       = require( 'express' ),
    app           = express(),

    passport      = require( 'passport' ),
    LocalStrategy = require( 'passport-local' ).Strategy,
    mongoose      = require ( 'mongoose' ),

    User, server
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

//-------------------- BEGIN EXPRESS CONFIG ----------------------
require( './server/config/express' )( app, config, env );
//--------------------- END EXPRESS CONFIG -----------------------

//----------------- BEGIN SERVER SIDE ROUTING --------------------
require( './server/config/routes' )( app );
//------------------ END SERVER SIDE ROUTING ---------------------

//------------------ BEGIN MONGODB CONNECTION --------------------
require( './server/config/mongoose' )( config );
//------------------- END MONGODB CONNECTION ---------------------

//------------------ BEGIN PASSPORT STRATEGY ---------------------
User = mongoose.model( 'User' );

passport.use( new LocalStrategy(
    function( username, password, done ) {
        User.findOne({ username : username }).exec( function( err, user ) {
            if ( user ) {
                // check if password matches
                user.comparePassword( password, function(err, isMatch) {
                    if ( err ) { throw err; }
                    if ( isMatch ) { return done( null, user ); }
                    return done( null, false );
                });
            }
            else {
                return done( null, false );
            }
        });
    }
));

passport.serializeUser( function( user, done ) {
    if ( user ) {
        done( null, user._id );
    }
});

passport.deserializeUser( function( id, done ) {
    User.findOne({ _id : id }).exec( function( err, user ) {
        if ( user ) {
            return done( null, user );
        }
        return done( null, false );
    });
});

//------------------- END PASSPORT STRATEGY ----------------------

//------------------- BEGIN SERVER START-UP ----------------------
server = app.listen( config.port );
console.log( 'Listening on port %d in %s env...', server.address().port, env );
//-------------------- END SERVER START-UP -----------------------

//------------------ BEGIN TICKER AND WATCHER --------------------
require( './server/config/watcher-ticker' )( config, env, server );
//------------------- END TICKER AND WATCHER ---------------------
