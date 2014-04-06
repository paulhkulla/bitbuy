/*
 * routes.js - module to provide routing
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*jslint node:true */ 
/*global */

//---------------- BEGIN MODULE SCOPE VARIABLES ------------------
'use strict';

var
    http      = require('http'),
    express   = require('express'),
    watcher   = require('./lib/watcher'),

    app       = express(),
    server    = http.createServer( app ),
    publicDir = __dirname + '/public'
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

//----------------- BEGIN SERVER CONFIGURATION -------------------
app.use(express.static( publicDir ));

app.get( '/', function ( request, response ) {
    response.redirect( '/bitbuy.html' );
});
//------------------ END SERVER CONFIGURATION --------------------

//--------------------- BEGIN START SERVER -----------------------
watcher( 
    { 
        server : server,
        publicDir : publicDir
    },
    [
        'bitbuy.html',
        'css/smartadmin-production.css',
        'css/bootstrap.min.css',
        'css/your_style.css',
        'js/app.js'
    ]
);

server.listen( 8080 );
console.log( 'Server listening on port %d', server.address().port );
//---------------------- END START SERVER ------------------------
