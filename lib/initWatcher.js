/*
 * initWatcher.js - module that provides functionality to watch
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
    initWatcher,

    watchers  = []
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

//------------------- BEGIN UTILITY METHODS ----------------------
function addWatchFile( absolutePath, io, pollingInterval, file, eventType ) {
    if ( watchers[absolutePath] ) {
        return;
    }

    fs.watchFile( absolutePath, { interval: pollingInterval }, function (curr, prev) {
        if ( curr.mtime !== prev.mtime ) {
            io.sockets.emit( eventType, '/' + file );
        }

        watchers[absolutePath] = true;
    });

    // console.log( 'Watching changes to %s', absolutePath );
}
//-------------------- END UTILITY METHODS -----------------------

//-------------------- BEGIN PUBLIC METHODS ----------------------
initWatcher = function ( configMap, fileMap ) {

    var
        absolutePath, eventType,
        i
        ;

    for ( i = 0; i < fileMap.pubFiles.length; i++ ) {

        if ( fileMap.pubFiles[i].indexOf( '.css' ) >= 0 ) {
            eventType = 'stylesheet';
        }
        else {
            eventType = 'reload';
        }

        absolutePath = path.join( configMap.pubDir, fileMap.pubFiles[i] );
        addWatchFile(
            absolutePath,
            configMap.io,
            configMap.pollingInterval,
            fileMap.pubFiles[i],
            eventType
        );
    }

    for ( i = 0; i < fileMap.privFiles.length; i++ ) {
        absolutePath = path.join( configMap.privDir, fileMap.privFiles[i] );
        addWatchFile(
            absolutePath,
            configMap.io,
            configMap.pollingInterval,
            fileMap.privFiles[i],
            'reload'
        );
    }

    console.log( '** Watcher initialized, polling files in %s and %s at %dms **',
        configMap.privDir,
        configMap.pubDir,
        configMap.pollingInterval
    );

};

module.exports = initWatcher;
//--------------------- END PUBLIC METHODS -----------------------
