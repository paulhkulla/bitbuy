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
/*global */

//---------------- BEGIN MODULE SCOPE VARIABLES ------------------
'use strict';

var
    env         = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    publicDir   = __dirname + '/public',
    privateDir  = __dirname + '/server', 
    watcher     = require('./lib/watcher'),
    ticker      = require('./lib/ticker'),
    logger      = require( 'morgan' ),
    bodyParser  = require( 'body-parser' ),
    consolidate = require( 'consolidate' ),
    express     = require( 'express' ),
    app         = express(),
    port        = 3030,
    swig        = require( 'swig' ),

    server, io
    ;

if ( app.get('env') === 'development' ) {
    swig.setDefaults({ cache: false });
    console.log('DEV');
}

app.engine( 'html', consolidate.swig );

app.set( 'view engine', 'html' );
app.set( 'views', privateDir + '/views' );

app.use( express.static( publicDir ) );
app.use( logger( 'dev' ) );
app.use( bodyParser() );

app.get( '*', function( req, res ) {
    res.render( 'index' );
});

server = app.listen( port );
console.log( 'Listening on port %d...', server.address().port );

io = ticker.connect( server );

watcher( 
    { 
        io : io,
        privateDir : privateDir,
        publicDir  : publicDir
    },
    {
        private : [
            'views/index.html',
            'includes/layout.html',
            'includes/scripts.html',
        ],
        public : [
            'css/smartadmin-production.css',
            'css/bootstrap.min.css',
            'css/your_style.css',
            'css/smartadmin-skins.css',
            'js/app.js'
        ]
    }
);
