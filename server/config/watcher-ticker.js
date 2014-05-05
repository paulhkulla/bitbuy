/*
 * watcher-ticker.js
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
    watcher = require('../../lib/watcher'),
    ticker  = require('../../lib/ticker'),
    io
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = function( config, env, server ) {

    io = ticker.connect( server );

    if ( env === 'development' ) {
        watcher( 
            { 
                io : io,
                privateDir : config.rootPath + '/server',
                publicDir  : config.rootPath + '/public'
            },
            {
                private : [
                    '/views/index.html',
                    '/includes/layout.html',
                    '/includes/scripts.html',
                    '/views/partials/main.html',
                ],
                public : [
                    '/css/smartadmin-production.css',
                    '/css/bootstrap.min.css',
                    '/css/your_style.css',
                    '/css/smartadmin-skins.css',
                    '/js/app.js',
                    '/app/app.js',
                    '/app/partials/main.html'
                ]
            }
        );
    }
};
