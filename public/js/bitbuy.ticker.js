/*
 * routes.js - module to provide routing
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global, $, bitbuy, io, Odometer */

bitbuy.ticker = (function () {

    //---------------- BEGIN MODULE SCOPE VARIABLES ------------------
    var
        configMap = {},
        stateMap  = {
            $container  : undefined
        },
        socket    = io.connect(),

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
        visibleLabelsCount = 0
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


    socket.on('graph_data', function ( data ) {

        /* sales chart */

        var $chrt_border_color = "rgba(255, 255, 255, 0.25)";
        var $chrt_second = "#99CC00";

        if ($("#saleschart").length) {
            var d = data;

            for (var i = 0; i < d.length; ++i)
                d[i][0] += 60 * 60 * 1000;

            var options = {
                xaxis : {
                    mode : "time",
                    // tickLength : 5
                },
                yaxis : {
                    min: 300
                },
                series : {
                    lines : {
                        show : true,
                        lineWidth : 1,
                        fill : true,
                        fillColor : {
                            colors : [{
                                opacity : 0.1
                            }, {
                                opacity : 0.6
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
                    borderWidth : 1,
                    borderColor : $chrt_border_color,
                },
                tooltip : true,
                tooltipOpts : {
                    content : "Bitcoini hind <b>%x</b> oli <span>€%y</span>",
                    dateFormat : "%0d/%0m %H:%M:%S",
                    defaultTheme : false
                },
                colors : [$chrt_second],

            };

            var plot = $.plot($("#saleschart"), [d], options);
        };

        /* end sales chart */
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

    socket.on('connect', function() {
        changeStatusCircle( jqueryMap.$status_circle, 'connected', connectedMsg, true );
        doTooltipShow = true;
    });
    socket.on('connecting', function() {
        changeStatusCircle( jqueryMap.$status_circle, 'connecting', connectingMsg, true );
    });
    setInterval(function(){
        if ( !socket.socket.connected ) {
            socket = io.connect();
            if ( doTooltipShow ) {
                changeStatusCircle( jqueryMap.$status_circle, 'disconnected', disconnectedMsg, doTooltipShow );
                doTooltipShow = false;
            }
        }
    }, 10000);


    socket.emit('subscribe', 'buyers');

    socket.on('connection_status_change', function ( status ) {

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


    socket.on('initial_price', function ( data ) {
        var long_price = data.lastAskEur * 100;
        
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

    socket.on('price_change', function ( price ) {
        var
            label_class, icon_class, border_class,
            span_element,
            long_price        = price * 100,
            diffFromLastPrice = ( long_price - lastPrice ) / 100;

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
    // END PUBLIC method /initModule/

    return { initModule : initModule };
    //--------------------- END PUBLIC METHODS -----------------------
}());

