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
    createWatcher,

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

    console.log( 'Watching changes to %s', absolute );
}
//-------------------- END UTILITY METHODS -----------------------

//-------------------- BEGIN PUBLIC METHODS ----------------------
createWatcher = function ( configMap, fileMap ) {

    var
        io = configMap.io,
        absolute, eventType, i
        ;

    for ( i = 0; i < fileMap.public.length; i++ ) {

        if ( fileMap.public[i].indexOf( '.css' ) >= 0 ) {
            eventType = 'stylesheet';
        }
        else {
            eventType = 'reload';
        }

        absolute = path.join( configMap.publicDir, fileMap.public[i] );
        addWatchFile ( absolute, io, fileMap.public[i], eventType );
    }

    for ( i = 0; i < fileMap.private.length; i++ ) {
        absolute = path.join( configMap.privateDir, fileMap.private[i] );
        addWatchFile ( absolute, io, fileMap.private[i], 'reload' );
    }
};

module.exports = createWatcher;
//--------------------- END PUBLIC METHODS -----------------------
