/*
* token.js
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
    TokenSchema
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( config ) {

    TokenSchema = mongoose.Schema({
        token : {
            type : String
        },
        date_created : { 
            type: Date,
            default: Date.now
        }
    });

    TokenSchema.statics.hasExpired = function( date_created, token_exp ) {
        var 
            now = new Date(),
            diff = ( now.getTime() - date_created );
        
        return diff > token_exp;
    };

    mongoose.model( 'Token', TokenSchema );

};

