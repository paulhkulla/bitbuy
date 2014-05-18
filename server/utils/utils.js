/*
 * utils.js - utilities
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
    bcrypt             = require( 'bcrypt' ),
    jwt                = require( 'jwt-simple' )
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( config ) {

    return {
        hash : function( input, cb ) {
            bcrypt.genSalt( config.SALT_WORK_FACTOR, function( err, salt ) {
                if ( err ) { return cb( err, null ); }

                // hash the access_token along with our new salt
                bcrypt.hash( input, salt, function( err, hash ) {
                    if ( err ) { return cb( err, null ); }
                    cb( false, hash );
                });
            });
        },

        compareHash : function( candidateHash, hash, callback ) {
            bcrypt.compare( candidateHash, hash, function( err, isMatch ) {
                if ( err ) { return callback( err ); }
                callback( null, isMatch );
            });
        },

        jwtEncode : function( data ) {
            return jwt.encode( data, config.token_secret );
        },

        jwtDecode : function( data ) {
            return jwt.decode( data, config.token_secret );
        },
    };

};
