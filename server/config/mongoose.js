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

    mongoose.connect( config.db );
    db = mongoose.connection;
    db.on( 'error', console.error.bind( console, 'db connection error') );
    db.once( 'open', function() { console.log( 'db connection established' ); } );

    require( '../../app/models/token' )( config );
    require( '../../app/models/user' )( config );

};
