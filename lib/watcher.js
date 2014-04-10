/*
 * watcher.js - module that provides functionality to watch
 * for changes in specified files and emits events to client
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
    fs        = require('fs'),
    path      = require('path'),
    socket    = require('socket.io'),

    watchers  = {}
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

//------------------- BEGIN UTILITY METHODS ----------------------
function addWatchFile ( absolute, io, file, eventType ) {
    if ( watchers[absolute] ) {
        return;
    }

    fs.watchFile( absolute, { interval: 500 }, function (curr, prev) {
        if ( curr.mtime !== prev.mtime ) {
            io.sockets.emit( eventType, file );
        }

        watchers[absolute] = true;
    });

    console.log( 'Watching changes to %s', file );
}
//-------------------- END UTILITY METHODS -----------------------

//-------------------- BEGIN PUBLIC METHODS ----------------------
function createWatcher ( configMap, fileMap ) {

    var
        io = socket.listen( configMap.server ),
        absolute, eventType, i
        ;

    for ( i = 0; i < fileMap.length; i++ ) {

        if ( fileMap[i].indexOf( '.css' ) >= 0 ) {
            eventType = 'stylesheet';
        }
        else {
            eventType = 'reload';
        }

        absolute = path.join( configMap.publicDir, fileMap[i] );
        addWatchFile ( absolute, io, fileMap[i], eventType );
    }
}

module.exports = createWatcher;
//--------------------- END PUBLIC METHODS -----------------------
