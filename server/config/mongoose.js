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
        utils = require( './utils' )( config );

    mongoose.connect( config.db );
    db = mongoose.connection;
    db.on( 'error', console.error.bind( console, 'db connection error') );
    db.once( 'open', function() { console.log( 'db connection established' ); } );

    require( './token-model' )( config );
    require( './user-model' )( config );

    User = mongoose.model( 'User' );

    User.find({}).exec(function( err, collection ) {
        var testUser = new User({ firstName: 'Obi-wan', lastName: 'Kenobi', username: 'obi@email.com', password: 'jaladmaha', birthday: "1990-09-05" });
        testUser.save(function (err) {
            if (err) {
                console.log(err);
            }
        });
        if ( collection.length === 0 ) {
            utils.hash( 'joe', function( err, hashedPassword ) {
                User.create({ firstName: 'Joe', lastName: 'Eames', euroBalance: 9534, btcBalance: 100.34522, username: 'joe', password: hashedPassword });
            });
            utils.hash( 'kokaiin', function( err, hashedPassword ) {
                User.create({ firstName: 'Markus', lastName: 'Pint', euroBalance: 10232.99, btcBalance: 1, username: 'markuspint@hotmail.com', password: hashedPassword, token_exp : 15000 });
            });
        }
    });

};
