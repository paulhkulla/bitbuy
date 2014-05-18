/*
 * watcher.js - config watcher
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
    //---------------- BEGIN CONFIGURABLE VARIABLES ------------------
    pollingInterval = 100,

    privDir    = './app/views',
    exclPrivDirs = [
        'node_modules',
        'public',
        '.git'
    ],

    pubDir     = './public',
    exclPubDirs  = [
        'vendor',
        'LESS_FILES',
        'plugin',
        'img',
        'fonts',
        'sound'
    ],
    //----------------- END CONFIGURABLE VARIABLES -------------------

    initWatcher  = require( '../../lib/initWatcher' ),
    walkSync = require( 'walk-sync' ),
    path     = require( 'path' ),

    i, j,
    substring,

    privFiles  = [],
    pubFiles   = []
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( config, env, io ) {

    privFiles = walkSync( privDir );

    for( i = privFiles.length -1; i >= 0 ; i-- ){
        if( privFiles[i].substr(-1) === '/' ){
            privFiles.splice(i, 1);
        }
        else {
            for ( j = 0; j !== exclPrivDirs.length; j++ ) {
                substring = exclPrivDirs[j];
                if ( privFiles[i].indexOf( substring ) !== - 1 ) {
                    privFiles.splice( i, 1 );
                    break;
                }
            }
        }
    }


    pubFiles = walkSync( pubDir );

    for ( i = pubFiles.length -1; i >= 0 ; i-- ) {
        if ( pubFiles[i].substr( -1 ) === '/' ) {
            pubFiles.splice( i, 1 );
        }
        else {
            for ( j = 0; j !== exclPubDirs.length; j++ ) {
                substring = exclPubDirs[j];
                if ( pubFiles[i].indexOf( substring ) !== - 1 ) {
                    pubFiles.splice( i, 1 );
                    break;
                }
            }
        }
    }


    if ( env === 'development' ) {
        initWatcher( 
            { 
                io : io,
                pollingInterval : pollingInterval,
                privDir : path.join( config.rootPath + privDir ),
                pubDir  : path.join( config.rootPath + pubDir )
            },
            {
                privFiles : privFiles,
                pubFiles  : pubFiles
            }
        );
    }

};
