/*
 * bbTicker.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp */

'use strict';

bbApp.directive("bbTicker", [
    '$timeout',
    '$rootScope',
    'bbSocketSvc',
    'bbBtcPriceSvc',
    function( $timeout, $rootScope, bbSocketSvc, bbBtcPriceSvc ) {
        return {
            restrict    : 'A',
            link        : function ( scope, element, attributes ) {
                //---------------- BEGIN MODULE SCOPE VARIABLES ------------------
                var
                configMap = {},
                stateMap  = {
                    $container  : undefined
                },
                // socket    = io.connect(),

                odometerObject,

                jqueryMap = {},
                setJqueryMap,
                initModule,
                connectedMsg    = 'Otseühendus',
                connectingMsg   = 'Otseühenduse loomine',
                disconnectedMsg = 'Otseühendus pole saadaval',
                lastPrice,
                changeStatusCircle,
                doTooltipShow = true, doTooltipShow2 = true,
                visibleLabelsCount = 0,
                plotGraph,
                dataCache = [],
                timeSpan
                ;
                //----------------- END MODULE SCOPE VARIABLES -------------------

                //--------------------- BEGIN DOM METHODS ------------------------
                setJqueryMap = function () {
                    jqueryMap = {
                        $container              : stateMap.$container,
                        $odometer_container     : stateMap.$container.find('.odometer-container')[0],
                        $status_circle          : stateMap.$container.find('.status-circle'),
                        $price_labels_container : stateMap.$container.find('#price-labels'),
                        $border_container       : stateMap.$container.find('#euro-and-price')
                    };
                };

                plotGraph = function ( data, time_span ) {
                    var 
                    $chrt_border_color = "rgba(255, 255, 255, 0.25)",
                    $chrt_second = "#99CC00",
                    options,
                    current_timestamp = new Date().getTime(),
                    max, min,
                    d = data.d,
                    i,
                    plot,
                    x_min,
                    dataMin = data.min,
                    dataMax = data.max,
                    calcMax = -Infinity,
                    calcMin = +Infinity,
                    format_as_euro
                    ;

                    if ( time_span ) {

                        if ( time_span === '30min' ) {
                            x_min = current_timestamp - ( 30 * 60 * 1000 );
                        }
                        if ( time_span === '1H' ) {
                            x_min = current_timestamp - ( 1 * 3600 * 1000 );
                        }
                        if ( time_span === '24H' ) {
                            x_min = current_timestamp - ( 24 * 3600 * 1000 );
                        }
                        else if ( time_span === 'week' ) {
                            x_min = current_timestamp - ( 7 * 24 * 3600 * 1000 );
                        }

                        for (i = 0; i < d.length; ++i) {
                            if ( d[i][0] > x_min ) {

                                if ( d[i][1] > calcMax ) {
                                    calcMax = d[i][1];
                                }
                                if ( d[i][1] < calcMin ) {
                                    calcMin = d[i][1];
                                }
                            }
                        }

                        max = calcMax * 1.005;
                        min = calcMin * 0.995;

                    }
                    else {
                        max = dataMax * 1.005;
                        min = dataMin * 0.995;
                    }

                    if ($("#bitcoin-price-graph").length) {

                        format_as_euro = function ( val ) {
                            return '€' + val;
                        };

                        options = {
                            xaxis : {
                                mode : "time",
                                timezone: "browser",
                                min: x_min,
                                tickLength : 5
                            },
                            yaxis : {
                                min: min,
                                max: max,
                                tickFormatter: format_as_euro
                            },
                            series : {
                                lines : {
                                    show : true,
                                    lineWidth : 1,
                                    fill : true,
                                    fillColor : {
                                        colors : [{
                                            opacity : 0
                                        }, {
                                            opacity : 0.5
                                        }]
                                    }
                                },
                                //points: { show: true },
                                shadowSize : 0
                            },
                            selection : {
                                mode : "x"
                            },
                            grid : {
                                hoverable : true,
                                clickable : true,

                                tickColor : $chrt_border_color,
                                borderWidth : 0,
                                borderColor : $chrt_border_color,
                            },
                            tooltip : true,
                            tooltipOpts : {
                                content : "Bitcoini hind <b>%x</b> oli <span>%y</span>",
                                dateFormat : "%0d/%0m %H:%M:%S",
                                defaultTheme : false
                            },
                            colors : [$chrt_second],

                        };

                        plot = $.plot($("#bitcoin-price-graph"), [d], options);
                    }

                };

                bbSocketSvc.on('graph_initial_data', function ( data )  {

                    if ( dataCache.length < 1 ) {
                        dataCache = data;
                    }

                    plotGraph( dataCache, '' );
                    timeSpan = '';

                    plotGraph( dataCache, timeSpan );
                    $('#graph-all').click(function(e) {
                        plotGraph( dataCache, '' );
                        timeSpan = '';
                        e.preventDefault();
                    });
                    $('#graph-week').click(function(e) {
                        plotGraph( dataCache, 'week' );
                        timeSpan = 'week';
                        e.preventDefault();
                    });
                    $('#graph-24h').click(function(e) {
                        plotGraph( dataCache, '24H' );
                        timeSpan = '24H';
                        e.preventDefault();
                    });
                    $('#graph-1h').click(function(e) {
                        plotGraph( dataCache, '1H' );
                        timeSpan = '1H';
                        e.preventDefault();
                    });
                    $('#graph-30min').click(function(e) {
                        plotGraph( dataCache, '30min' );
                        timeSpan = '30min';
                        e.preventDefault();
                    });

                });

                bbSocketSvc.on('graph_update', function ( data )  {

                    dataCache.d.push( data.d );
                    dataCache.max = data.max;
                    dataCache.min = data.min;

                    plotGraph( dataCache, timeSpan );

                });
                scope.$on( '$stateChangeSuccess', function( event, toState, toParams, fromState, fromParams ) {
                    plotGraph( dataCache, timeSpan );

                    plotGraph( dataCache, timeSpan );
                    $('#graph-all').click(function(e) {
                        plotGraph( dataCache, '' );
                        timeSpan = '';
                        e.preventDefault();
                    });
                    $('#graph-week').click(function(e) {
                        plotGraph( dataCache, 'week' );
                        timeSpan = 'week';
                        e.preventDefault();
                    });
                    $('#graph-24h').click(function(e) {
                        plotGraph( dataCache, '24H' );
                        timeSpan = '24H';
                        e.preventDefault();
                    });
                    $('#graph-1h').click(function(e) {
                        plotGraph( dataCache, '1H' );
                        timeSpan = '1H';
                        e.preventDefault();
                    });
                    $('#graph-30min').click(function(e) {
                        plotGraph( dataCache, '30min' );
                        timeSpan = '30min';
                        e.preventDefault();
                    });
                });

                //---------------------- END DOM METHODS -------------------------

                changeStatusCircle = function ( element, status, tooltip_msg, do_tooltip ) {
                    element
                    .removeClass('status-circle-connected')
                    .removeClass('status-circle-connecting')
                    .removeClass('status-circle-disconnected')
                    .addClass('status-circle-' + status)
                    .addClass('animated wobble')
                    .attr('data-original-title', tooltip_msg)
                    .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                        $(this).removeClass('animated wobble');
                    });
                    if ( do_tooltip ) {
                        element
                        .tooltip('show')
                        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                            $(this).removeClass('animated wobble');
                        });
                        setTimeout(function(){
                            element.tooltip('hide');
                        }, 1500);
                    }
                };
                //------------------- BEGIN EVENT LISTENERS ----------------------

                bbSocketSvc.on('connect', function() {
                    changeStatusCircle( jqueryMap.$status_circle, 'connected', connectedMsg, true );
                    doTooltipShow = true;
                });
                bbSocketSvc.on('connecting', function() {
                    changeStatusCircle( jqueryMap.$status_circle, 'connecting', connectingMsg, true );
                });
                // setInterval(function(){
                    //     if ( !socket.socket.connected ) {
                        //         socket = io.connect();
                        //         if ( doTooltipShow ) {
                            //             changeStatusCircle( jqueryMap.$status_circle, 'disconnected', disconnectedMsg, doTooltipShow );
                            //             doTooltipShow = false;
                            //         }
                            //     }
// }, 10000);


                            bbSocketSvc.emit('subscribe', 'buyers');

                            bbSocketSvc.on('connection_status_change', function ( status ) {

                                if ( status === 'connected' ) {
                                    changeStatusCircle( jqueryMap.$status_circle, 'connected', connectedMsg, true );
                                    doTooltipShow = true;
                                    doTooltipShow2 = false;
                                }
                                else if ( status === 'connecting' ) {
                                    changeStatusCircle( jqueryMap.$status_circle, 'connecting', connectingMsg, doTooltipShow2 );
                                    doTooltipShow2 = false;
                                }
                                else {
                                    changeStatusCircle( jqueryMap.$status_circle, 'disconnected', disconnectedMsg, doTooltipShow );
                                    doTooltipShow = false;
                                }
                            });


                            bbSocketSvc.on('initial_price', function ( data ) {
                                var long_price = data.lastAskEur * 100;

                                bbBtcPriceSvc.currentPrice = data.lastAskEur;

                                lastPrice = long_price;

                                long_price = long_price.toFixed(0);
                                odometerObject.update( long_price );

                                if ( data.pusherState === 'connected' ) {
                                    changeStatusCircle( jqueryMap.$status_circle, 'connected', connectedMsg, true );
                                }
                                else if ( data.pusherState === 'connecting' ) {
                                    changeStatusCircle( jqueryMap.$status_circle, 'connecting', connectingMsg, true );
                                }
                                else {
                                    changeStatusCircle( jqueryMap.$status_circle, 'disconnected', disconnectedMsg, true );
                                }
                            });

                            bbSocketSvc.on('price_change', function ( price ) {
                                var
                                label_class, icon_class, border_class,
                                span_element,
                                long_price        = price * 100,
                                diffFromLastPrice = ( long_price - lastPrice ) / 100;

                                bbBtcPriceSvc.currentPrice = price;

                                if ( diffFromLastPrice >= 0 ) {
                                    label_class  = 'label label-increase animated fast fadeInUp';
                                    icon_class   = 'fa fa-caret-up';
                                    border_class = 'border-green';
                                }
                                else {
                                    label_class       = 'label label-decrease animated fast fadeInDown';
                                    icon_class        = 'fa fa-caret-down';
                                    border_class      = 'border-red';
                                    diffFromLastPrice = diffFromLastPrice * -1;
                                }

                                long_price = long_price.toFixed(0);
                                odometerObject.update( long_price );
                                lastPrice = long_price;

                                diffFromLastPrice = diffFromLastPrice.toFixed(2);

                                span_element = $('<span class="' + label_class + '"><i class="' + icon_class + '"></i> ' + diffFromLastPrice + '</span>');
                                jqueryMap.$price_labels_container.append(span_element);
                                visibleLabelsCount = visibleLabelsCount + 1;

                                span_element.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                                    visibleLabelsCount = visibleLabelsCount - 1;
                                    if ( visibleLabelsCount < 1 ) {
                                        jqueryMap.$border_container
                                        .removeClass('border-red border-green')
                                        .addClass('border-grey');
                                    }
                                    $(this)
                                    .removeClass('animated fast fadeInUp fadeInDown')
                                    .delay(2000)
                                    .queue( function() {
                                        $(this).addClass('animated fadeOut');
                                    });
                                });

                                jqueryMap.$border_container
                                .removeClass('border-grey border-red border-green')
                                .addClass(border_class);
                            });
                            //-------------------- END EVENT LISTENERS -----------------------

                            //-------------------- BEGIN PUBLIC METHODS ----------------------
                            initModule = function ( $container ) {
                                // load HTML and map jQuery collections
                                stateMap.$container = $container;
                                setJqueryMap();

                                odometerObject = new Odometer({
                                    el       : jqueryMap.$odometer_container,
                                    format   : '(dddd.dd).dd',
                                    duration : 500
                                });
                            };
                            initModule( $('#price-group') );
            }
        };
}]);
