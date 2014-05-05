/*
 * config.js
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
    express      = require( 'express' ),
    logger       = require( 'morgan' ),
    cookieParser = require( 'cookie-parser' ),
    bodyParser   = require( 'body-parser' ),
    session      = require( 'express-session' ),
    passport     = require( 'passport' ),
    consolidate  = require( 'consolidate' ),
    swig         = require( 'swig' ),

    swigCache
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function(app, config, env) {

    //------------------- BEGIN TEMPLATE CONFIG ----------------------
    swigCache = env === 'development' ? false : 'memory';
    swig.setDefaults({ 
        cache: swigCache,
        varControls: [ '{[{', '}]}' ]
    }); 
    app.engine( 'html', consolidate.swig );
    app.set( 'view engine', 'html' );
    app.set( 'views', config.rootPath + '/server/views' );
    //-------------------- END TEMPLATE CONFIG -----------------------

    //-------------------- BEGIN EXPRESS CONFIG ----------------------
    app.use( express.static( config.rootPath + '/public' ) );
    app.use( logger( 'dev' ) );
    app.use( cookieParser() );
    app.use( bodyParser() );
    app.use( session({ secret: 'never stop dreaming' }) );
    app.use( passport.initialize() );
    app.use( passport.session() );
    //--------------------- END EXPRESS CONFIG -----------------------
};
