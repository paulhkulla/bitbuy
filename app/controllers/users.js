/*
 * users.js - users controller
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
    mongoose = require('mongoose'),
    User     = mongoose.model( 'User' );
//----------------- END MODULE SCOPE VARIABLES -------------------

exports.getUsers = function( req, res ) {

    User.find({}).exec( function( err, collection ) {
        res.send( collection.map( function(doc) {
            return doc.toJSON({ getters : true });
        }));
        res.end();
    });

};

exports.createUser = function( req, res, next ) {

    var user;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    user = new User( req.body );

    user.save( function( err ) {
        if ( err ) {
            if ( err.toString().indexOf( 'E11000' ) > -1 ) {
                err = new Error( 'Duplicate e-mail' );
            }
            res.status( 400 );
            return res.send({ reason : err.toString() });
        }
        res.send( "success" );
    });
};
