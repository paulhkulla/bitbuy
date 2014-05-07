/*
 * auth.js
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
    passport = require( 'passport' ),
    mongoose = require('mongoose'),
    User     = mongoose.model('User');
//----------------- END MODULE SCOPE VARIABLES -------------------

exports.authenticate = function( req, res, next ) {
    var auth = passport.authenticate( 'local', { session: false }, function( err, user ) {
        if ( err ) { return next( err ); }
        if ( !user ) { return res.send({ success : false }); }
        User.createUserAccessToken( user.username, function( err, access_token ) {
            if ( err ) { return next( err ); }
            res.send({
                success : true,
                user    : {
                    username     : user.username,
                    firstName    : user.firstName,
                    lastName     : user.lastName,
                    euroBalance  : user.euroBalance,
                    btcBalance   : user.btcBalance,
                    access_token : access_token
                }
            });
        });
    });
    auth( req, res, next );
};
