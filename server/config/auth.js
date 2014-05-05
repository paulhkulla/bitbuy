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
var passport = require( 'passport' );
//----------------- END MODULE SCOPE VARIABLES -------------------

exports.authenticate = function( req, res, next ) {
    var auth = passport.authenticate( 'local', function( err, user ) {
        if ( err ) { return next( err ); }
        if ( !user ) { res.send({ success : false }); }
        req.logIn( user, function( err ) {
            if ( err ) { return next( err ); }
            res.send({ success : true, user : user });
        });
    });
    auth( req, res, next );
};
