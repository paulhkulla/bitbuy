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

    db
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( config ) {

    var 
        User, 
        utils = require( '../utils/utils' )( config );

    mongoose.connect( config.db );
    db = mongoose.connection;
    db.on( 'error', console.error.bind( console, 'db connection error') );
    db.once( 'open', function() { console.log( 'db connection established' ); } );

    require( '../../app/models/token' )( config );
    require( '../../app/models/user' )( config );

    User = mongoose.model( 'User' );

    User.find({}).exec(function( err, collection ) {
        if ( collection.length === 0 ) {
            var testUser1 = new User({ firstName: 'Obi-wan', lastName: 'Kenobi', username: 'admin@gmail.com', password: 'jaladmaha', birthday: "1990-09-05", roles: [ 'admin', 'user' ] });
            testUser1.save(function (err) {
                if (err) {
                    console.log(err);
                }
            });
            var testUser2 = new User({ firstName: 'Joe', lastName: 'Rogan', username: 'joe@gmail.com', password: 'koerapoeg', birthday: "1956-12-01", roles: [ 'user' ], token_exp: 10000 });
            testUser2.save(function (err) {
                if (err) {
                    console.log(err);
                }
            });
            var testUser3 = new User({ firstName: 'Dan', lastName: 'Wahlin', username: 'dan@gmail.com', password: 'kassipoeg', birthday: "1988-01-30" });
            testUser3.save(function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });

};
