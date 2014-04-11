/*
 * ticker.js - handle Bitstamp ticker
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
    tickerObj,
    socket             = require( 'socket.io' ),
    crud               = require( './crud' ),
    Pusher             = require( 'pusher-client' ),

    pusher             = new Pusher( 'de504dc5763aeef9ff52' ),
    order_book_channel = pusher.subscribe( 'order_book' ),

    makeMongoId        = crud.makeMongoId,

    eventEmitter       = crud.eventEmitter,
    
    lastBid, lastAsk,

    timer,
    isTimerRunning = false,

    emitPriceChange, getLastPrice
    ;
//----------------- END MODULE SCOPE VARIABLES -------------------

//------------------- BEGIN UTILITY METHODS ----------------------

// emitPriceChange - broadcast price  change to all connected clients
emitPriceChange = function ( io, room, price ) {
    io.in(room).emit( 'price_change', price );
}; 

// getLastPrice - fetch last entered price from database
getLastPrice = function ( obj_type, fields_map, callback ) {
    crud.getLast( obj_type, fields_map, callback );
};
//-------------------- END UTILITY METHODS -----------------------

//-------------------- BEGIN PUBLIC METHODS ----------------------
tickerObj = {
    connect : function ( server ) {
        var io = socket.listen( server );

        // Begin io setup
        io
            .set( 'blacklist', [] )
            .on ( 'connection', function ( socket ) {
                // Listen for which price is required and emit
                // accordingly
        });
        // End io setup

        return io;
    }
};

module.exports = tickerObj;
//--------------------- END PUBLIC METHODS -----------------------

//----------------- BEGIN MODULE INITILIZATION -------------------
eventEmitter.on('connectedToMongo', function() {
    if ( !lastAsk ) {
        getLastPrice( 'asks', {}, function( map_list ) { 
            if ( !map_list ) { return; }
            lastAsk = map_list.bitstamp_ask_price_USD; 
            console.log(lastAsk);
            return;
        });
    }
    if ( !lastBid ) {
        getLastPrice( 'bids', {}, function( map_list ) {
            if ( !map_list ) { return; }
            lastBid = map_list.bitstamp_bid_price_USD; 
            console.log(lastBid);
            return;
        });
    }
});

// handle saving needed data to BD from Bitstamp API
(function () {
    // Periodically get currency conversion rates

    // Begin /data/ message handler
    order_book_channel.bind( 'data', function( data ) {
        var
            currentBid, currentAsk;

        currentAsk = { 
            BTC : data['asks'][0][1],
            USD : data['asks'][0][0]
        };

        currentBid = { 
            BTC : data['bids'][0][1],
            USD : data['bids'][0][0]
        };

        if ( !lastAsk || (currentAsk.USD !== lastAsk)) {
            console.log( 
                'Most recent ask: %d BTC at %d USD',
                currentAsk.BTC, currentAsk.USD
            );

            crud.construct ( 
                'asks',
                {
                    'bitstamp_ask_amount'    : parseFloat(currentAsk.BTC),
                    'bitstamp_ask_price_USD' : parseFloat(currentAsk.USD)
                },
                function( result_map ) { console.log( "Saved bid into database:", result_map ); }
            );

            lastAsk = currentAsk.USD;
        }

        if ( !lastBid || (currentBid.USD !== lastBid) ) {
            console.log( 
                'Most recent bid: %d BTC at %d USD',
                currentBid.BTC, currentBid.USD
            );
            crud.construct ( 
                'bids',
                {
                    'bitstamp_bid_amount'    : parseFloat(currentBid.BTC),
                    'bitstamp_bid_price_USD' : parseFloat(currentBid.USD)
                },
                function( result_map ) { console.log( "Saved bid into database:", result_map ); }

            );
            lastBid = currentBid.USD;
        }
    }); 
    // End /data/ message handler

    // Begin /state_change/ message handler
    pusher.connection.bind('state_change', function(states) {
        console.log('Previous status: %s. New status: %s', states.previous, states.current);

        if ( states.current === 'disconnected' && !isTimerRunning )
        {
            timer = setInterval(function() {
                pusher.connect();
                console.log('hit timer');
            }, 10000);
            isTimerRunning = true;
        }
        if ( isTimerRunning && states.current === 'connected' ) {
            clearInterval(timer);
            isTimerRunning = false;
            console.log('cleared timer');
        }
    });
    // End /state_change/ message handler

}());

//------------------ END MODULE INITILIZATION --------------------
