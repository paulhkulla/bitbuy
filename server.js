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

'use strict';

//---------------- BEGIN MODULE SCOPE VARIABLES ------------------
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
    swig        = require( 'swig' ),
    mongoose    = require( 'mongoose' ),
    app         = express(),
    port        = 3030,

    server, io, db,
    messageSchema, Message, mongoMessage
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------


//------------------- BEGIN TEMPLATE CONFIG ----------------------
if ( env === 'development' ) { swig.setDefaults({ cache: false }); }

app.engine( 'html', consolidate.swig );

app.set( 'view engine', 'html' );
app.set( 'views', privateDir + '/views' );
//-------------------- END TEMPLATE CONFIG -----------------------


//-------------------- BEGIN EXPRESS CONFIG ----------------------
app.use( express.static( publicDir ) );
app.use( logger( 'dev' ) );
app.use( bodyParser() );
//--------------------- END EXPRESS CONFIG -----------------------


//----------------- BEGIN SERVER SIDE ROUTING --------------------
app.get( '*', function( req, res ) {
    res.render( 'index', {
        mongoMessage: mongoMessage
    });
});
//------------------ END SERVER SIDE ROUTING ---------------------


//------------------ BEGIN MONGODB CONNECTION --------------------
mongoose.connect( 'mongodb://jsbox.dev/bitbuy' );
db = mongoose.connection;
db.on( 'error', console.error.bind( console, 'db connection error') );
db.once( 'open', function() { console.log( 'db connection established' ); } );

messageSchema = mongoose.Schema({ message: String });
Message = mongoose.model( 'Message', messageSchema );
Message.findOne().exec( function( err, messageDoc ) {
    mongoMessage = messageDoc.message;
});
//------------------- END MONGODB CONNECTION ---------------------


//------------------- BEGIN SERVER START-UP ----------------------
server = app.listen( port );
console.log( 'Listening on port %d...', server.address().port );
//-------------------- END SERVER START-UP -----------------------


//------------------ BEGIN TICKER AND WATCHER --------------------
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
            'js/app.js',
            'app/app.js',
            'app/partials/main.html'
        ]
    }
);
//------------------- END TICKER AND WATCHER ---------------------
