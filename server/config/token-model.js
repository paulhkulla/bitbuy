/*
* token-model.js
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
    jwt      = require( 'jwt-simple' ),
    AccessTokenSchema
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( config ) {

    AccessTokenSchema = mongoose.Schema({
        token        : String,
        date_created : { type: Date, default: Date.now }
    });

    AccessTokenSchema.statics.hasExpired = function( date_created, token_exp ) {
        var 
            now = new Date(),
            diff = ( now.getTime() - date_created );
        
        return diff > token_exp;
    };

    AccessTokenSchema.statics.encode = function( data ) {
        return jwt.encode( data, config.token_secret );
    };

    AccessTokenSchema.statics.decode = function( data ) {
        return jwt.decode( data, config.token_secret );
    };

    mongoose.model( 'AccessToken', AccessTokenSchema );

};
