/*
 * ticker.js - handle bitstamp ticker
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
    socket                     = require( 'socket.io' ),
    crud                       = require( './crud' ),
    Pusher                     = require( 'pusher-client' ),
    Bitstamp                   = require('bitstamp'),

    pusher                     = new Pusher( 'de504dc5763aeef9ff52' ),
    order_book_channel         = pusher.subscribe( 'order_book' ),

    key                        = 'b3oFeEhYLlVXSxd67JNKszLQ1Bpoi2dk',
    secret                     = '9BVpjL3w35qC2y7LN0oV2tL0dmcsxPRq',
    client_id                  = 207970,

    publicBitstamp             = new Bitstamp(),
    privateBitstamp            = new Bitstamp(key, secret, client_id),

    makeMongoId                = crud.makeMongoId,

    eventEmitter               = crud.eventEmitter,

    currencyConversionInterval = 5 * 60 * 1000,

    lastBidEur, lastAskEur,

    timer,
    isTimerRunning = false,

    emitPriceChange, getLastAsk, getLastBid,

    transFee = 0.0299,

    updateCurrency, calculateWeightedAverage,

    weightedAvg, eurToUsd,

    getAllAsksData,
    allAsksData = [],
    maxAsk, minAsk,

    emitGraphUpdate
    ;
    
//----------------- END MODULE SCOPE VARIABLES -------------------

//------------------- BEGIN UTILITY METHODS ----------------------

// emitPriceChange - broadcast price  change to all connected clients
emitPriceChange = function ( io, room, price ) {
    io.sockets.in(room).emit( 'price_change', price );
}; 

// emitPriceChange - broadcast price  change to all connected clients
emitGraphUpdate = function ( io, room, data ) {
    io.sockets.in(room).emit( 'graph_update', data );
}; 

// getLastAsk - fetch last entered prices from database
getLastAsk = function () {
    crud.getLast( 'asks', {}, function( map_list ) { 
        if ( !map_list ) { return; }
        lastAskEur = map_list.bitbuy_ask_price_EUR;
        return;
    });
};

// getLastBid - fetch last entered prices from database
getLastBid = function () {
    crud.getLast( 'bids', {}, function( map_list ) {
        if ( !map_list ) { return; }
        lastBidEur = map_list.bitbuy_bid_price_EUR;
        return;
    });
};

// getAllAsksData - fetch all data needed for asks graphs
getAllAsksData = function () {
    crud.read( 'asks', {}, { bitbuy_ask_price_EUR : 1, _id : 1 }, function( result_map ) { 
        var 
        i, timestamp;

        maxAsk = -Infinity;
        minAsk = +Infinity;

        if ( !result_map ) { return; }

        for ( i = 0; i < Object.keys(result_map).length; i++ ) {
            if ( result_map[i].bitbuy_ask_price_EUR > maxAsk ) {
                maxAsk = result_map[i].bitbuy_ask_price_EUR;
            }
            if ( result_map[i].bitbuy_ask_price_EUR < minAsk ) {
                minAsk = result_map[i].bitbuy_ask_price_EUR;
            }

            timestamp = result_map[i]._id.toString().substring(0,8);
            timestamp = new Date( parseInt( timestamp, 16  ) * 1000  ).getTime();

            allAsksData.push([timestamp, result_map[i].bitbuy_ask_price_EUR]);
        }
        return;
    });
};

updateCurrency = function () {
    publicBitstamp.eur_usd( function( error, eur_to_usd ) {

        eurToUsd = eur_to_usd;

        crud.countDocs( 'currency', function( dbDepositCount ) {

            privateBitstamp.user_transactions(100, function (error, result) {
                if ( error ) { console.log( error ); return; };
                if ( result && result.error ) { console.log("Bitstamp private API error: %s", result.error); return; }
                var i, j, newDepositCount,
                    filtered = result.filter( function (el) {
                    return el.type === 0
                    && el.btc === '-0.00000000';
                });
                newDepositCount = Object.keys(filtered).length - dbDepositCount;
                console.log("New deposits detected: %d", newDepositCount);
                for ( i = newDepositCount; i > 0; --i ) {
                    j = i - 1;
                    crud.construct ( 
                        'currency',
                        {
                            deposit_amount : parseFloat( filtered[j].usd ),
                            eur_sell_rate : parseFloat( eur_to_usd.sell ),
                            eur_buy_rate : parseFloat( eur_to_usd.buy )
                        },
                        function( result_map ) {
                            console.log( "Saved into currency database:", result_map );
                            return;
                        }
                    );
                }
                calculateWeightedAverage();
            });
        });
    });
};

calculateWeightedAverage = function () {
    crud.read( 
        'currency',
        {},
        {
            'deposit_amount' : 1,
            'eur_sell_rate'  : 1
        },
        function ( result_map ) {
            var i,
                total_top    = 0,
                total_bottom = 0;

            for ( i = 0; i < Object.keys(result_map).length; i++ ) {
                total_top += result_map[i].deposit_amount * result_map[i].eur_sell_rate;
                total_bottom += result_map[i].deposit_amount;
            }
            weightedAvg = total_top / total_bottom;
        }
    );
};
//-------------------- END UTILITY METHODS -----------------------

//-------------------- BEGIN PUBLIC METHODS ----------------------
tickerObj = {
    connect : function ( server ) {
        var io = socket.listen( server, { log: false } );

        // Begin io setup
        io
            .set( 'blacklist', [] )
            .on ( 'connection', function ( socket ) {

                socket.on('subscribe', function(data) { 

                    socket.join( data ); 

                    if ( data === 'buyers' && lastAskEur ) {
                        socket.emit( 'initial_price',
                        { 
                            lastAskEur : lastAskEur,
                            pusherState : pusher.connection.state
                        });
                        socket.emit( 'graph_initial_data', { d : allAsksData, max : maxAsk, min : minAsk } );
                    }
                    if ( data === 'sellers' && lastBidEur ) {
                        socket.emit( 'initial_price', lastBidEur );
                    }
                });
            });
        // End io setup

        eventEmitter.on('connectedToMongo', function() {

            if ( !lastAskEur ) {
                getLastAsk();
            }
            if ( !lastBidEur ) {
                getLastBid();
            }
            if ( allAsksData.length < 1 ) {
                getAllAsksData();
            }

            // Continously update currency table
            updateCurrency();
            calculateWeightedAverage();
            timer = setInterval(function() {
                updateCurrency();
            }, currencyConversionInterval);

            // Begin /data/ message handler
            order_book_channel.bind( 'data', function( data ) {
                if ( eurToUsd ) { 
                    var
                        currentBid, currentAsk,
                        bitbuy_ask_price_USD, bitbuy_ask_price_EUR,
                        bitbuy_bid_price_USD, bitbuy_bid_price_EUR,
                        bitstamp_ask_price_USD_float, bitstamp_ask_amount_float,
                        bitstamp_bid_price_USD_float, bitstamp_bid_amount_float;

                    currentAsk = { 
                        BTC : data['asks'][0][1],
                        USD : data['asks'][0][0]
                    };

                    currentBid = { 
                        BTC : data['bids'][0][1],
                        USD : data['bids'][0][0]
                    };

                    bitstamp_ask_price_USD_float = parseFloat(currentAsk.USD);
                    bitstamp_ask_amount_float    = parseFloat(currentAsk.BTC);
                    bitstamp_bid_price_USD_float = parseFloat(currentBid.USD);
                    bitstamp_bid_amount_float    = parseFloat(currentBid.BTC);

                    bitbuy_ask_price_USD = bitstamp_ask_price_USD_float * ( 1 + transFee );
                    bitbuy_ask_price_USD = parseFloat(bitbuy_ask_price_USD.toFixed(2));
                    bitbuy_ask_price_EUR = bitbuy_ask_price_USD / weightedAvg;
                    bitbuy_ask_price_EUR = parseFloat(bitbuy_ask_price_EUR.toFixed(2));

                    bitbuy_bid_price_USD = bitstamp_bid_price_USD_float * ( 1 + transFee );
                    bitbuy_bid_price_USD = parseFloat(bitbuy_bid_price_USD.toFixed(2));
                    bitbuy_bid_price_EUR = bitbuy_bid_price_USD / eurToUsd.buy;
                    bitbuy_bid_price_EUR = parseFloat(bitbuy_bid_price_EUR.toFixed(2));

                    if ( bitbuy_ask_price_EUR !== lastAskEur ) {

                        if ( bitbuy_ask_price_EUR > maxAsk ) {
                            maxAsk = bitbuy_ask_price_EUR;
                        }
                        if ( bitbuy_ask_price_EUR < minAsk ) {
                            minAsk = bitbuy_ask_price_EUR;
                        }

                        emitPriceChange( io, 'buyers', bitbuy_ask_price_EUR ); 

                        crud.construct ( 
                            'asks',
                            {
                                'bitstamp_ask_amount'    : bitstamp_ask_amount_float,
                                'bitstamp_ask_price_USD' : bitstamp_ask_price_USD_float,
                                'bitbuy_ask_price_USD'   : bitbuy_ask_price_USD,
                                'bitbuy_ask_price_EUR'   : bitbuy_ask_price_EUR,
                                'bitbuy_ask_EUR_rate'    : weightedAvg,
                                'bitbuy_ask_fee'         : transFee
                            },
                            function( result_map ) {
                                var timestamp;

                                console.log( "Saved ask into database:", result_map );
                                lastAskEur = result_map[0].bitbuy_ask_price_EUR;

                                timestamp = result_map[0]._id.toString().substring(0,8);
                                timestamp = new Date( parseInt( timestamp, 16  ) * 1000  ).getTime();

                                emitGraphUpdate( io, 'buyers', { d : [ timestamp, bitbuy_ask_price_EUR ], max : maxAsk, min : minAsk } );

                                allAsksData.push( [ timestamp, bitbuy_ask_price_EUR ] );

                                return;
                            }
                        );
                    }

                    if ( bitbuy_bid_price_EUR !== lastBidEur ) {


                        emitPriceChange( io, 'sellers', bitbuy_bid_price_EUR ); 

                        crud.construct ( 
                            'bids',
                            {
                                'bitstamp_bid_amount'    : bitstamp_bid_amount_float,
                                'bitstamp_bid_price_USD' : bitstamp_bid_price_USD_float,
                                'bitbuy_bid_price_USD'   : bitbuy_bid_price_USD,
                                'bitbuy_bid_price_EUR'   : bitbuy_bid_price_EUR,
                                'bitbuy_bid_EUR_rate'    : parseFloat(eurToUsd.buy),
                                'bitbuy_bid_fee'         : transFee
                            },
                            function( result_map ) { 
                                console.log( "Saved bid into database:", result_map );
                                lastBidEur = result_map[0].bitbuy_bid_price_EUR;
                                return;
                            }
                        );
                    }

                }
            }); 
            // End /data/ message handler

            // Begin /state_change/ message handler
            pusher.connection.bind('state_change', function(states) {
                console.log('Previous status: %s. New status: %s', states.previous, states.current);

                io.sockets.emit( 'connection_status_change', states.current );

                if ( states.current === 'disconnected' && !isTimerRunning ) {

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
        });

        return io;
    }
};

module.exports = tickerObj;
//--------------------- END PUBLIC METHODS -----------------------
