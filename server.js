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

    server
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

//------------------ SETUP EXPRESS MIDDLEWARE --------------------
require( './server/config/express' )( app, config, env );

//------------------ SETUP MONGODB CONNECTION --------------------
require( './server/config/mongoose' )( config );

//----------------- SETUP PASSPORT MIDDLEWARE --------------------
require( './server/config/passport' )( config );

//----------------- SETUP SERVER SIDE ROUTING --------------------
require( './server/config/routes' )( app, config );

//------------------- BEGIN SERVER START-UP ----------------------
server = app.listen( config.port );
console.log( 'Listening on port %d in %s env...', server.address().port, env );
//-------------------- END SERVER START-UP -----------------------

//--------------- INITIALIZE WATCHER AND TICKER ------------------
require( './server/config/watcher-ticker' )( config, env, server );
