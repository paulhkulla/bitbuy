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
    fs       = require('fs'),
    http     = require('http'),
    path     = require('path'),
    express  = require('express'),
    socketIo = require('socket.io'),

    app      = express(),
    server   = http.createServer(app),
    io       = socketIo.listen(server),
    publicDir     = __dirname + '/public',
    watchers = {}
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

//------------------- BEGIN UTILITY METHODS ----------------------
function createWatcher (file, event) {
    var absolute = path.join(publicDir, file);
    if (watchers[absolute]) {
        return;
    }
    fs.watchFile(absolute, { interval: 1000 }, function (curr, prev) {
        if (curr.mtime !== prev.mtime) {
            io.sockets.emit(event, file);
        }
    });

    watchers[absolute] = true;
}
//-------------------- END UTILITY METHODS -----------------------

//----------------- BEGIN SERVER CONFIGURATION -------------------
app.use(express.static(publicDir));

app.get( '/', function ( request, response ) {
    response.redirect( '/bitbuy.html' );
});
//------------------ END SERVER CONFIGURATION --------------------

//--------------------- BEGIN START SERVER -----------------------
createWatcher( 'bitbuy.html', 'reload' );
createWatcher( 'css/smartadmin-production.css', 'stylesheet' );
createWatcher( 'css/bootstrap.min.css', 'stylesheet' );
createWatcher( 'css/your_style.css', 'stylesheet' );

server.listen(8080);
//---------------------- END START SERVER ------------------------
