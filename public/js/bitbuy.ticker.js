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
        disconnectedMsg = 'Otseühenduse pole saadaval',
        lastPrice
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
    //---------------------- END DOM METHODS -------------------------

    //------------------- BEGIN EVENT LISTENERS ----------------------

    socket.emit('subscribe', 'buyers');

    socket.on('connection_status_change', function ( status ) {

        if ( status === 'connected' ) {
            jqueryMap.$status_circle
            .removeClass('status-circle-offline')
            .removeClass('status-circle-connecting')
            .addClass('status-circle-online')
            .addClass('animated wobble')
            .attr('data-original-title', connectedMsg)
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass('animated wobble');
            });
        }
        else if ( status === 'connecting' ) {
            jqueryMap.$status_circle
            .removeClass('status-circle-online')
            .removeClass('status-circle-offline')
            .addClass('status-circle-connecting')
            .addClass('animated wobble')
            .attr('data-original-title', connectingMsg)
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass('animated wobble');
            });
        }
        else {
            jqueryMap.$status_circle
            .removeClass('status-circle-online')
            .removeClass('status-circle-connecting')
            .addClass('status-circle-offline')
            .addClass('animated wobble')
            .attr('data-original-title', disconnectedMsg)
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass('animated wobble');
            });
        }
    });

    socket.on('initial_price', function ( data ) {
        var long_price = data.lastAskEur * 100;
        
        lastPrice = long_price;

        long_price = long_price.toFixed(0);
        odometerObject.update( long_price );

        if ( data.pusherState === 'connected' ) {
            jqueryMap.$status_circle
                .removeClass('status-circle-offline')
                .removeClass('status-circle-connecting')
                .addClass('status-circle-online')
                .addClass('animated wobble')
                .attr('data-original-title', connectedMsg)
                .tooltip('show')
                .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                    $(this).removeClass('animated wobble');
                });
            setTimeout(function(){
                jqueryMap.$status_circle.tooltip('hide');
            }, 1500);
        }
        else if ( data.pusherState === 'connecting' ) {
            jqueryMap.$status_circle
                .removeClass('status-circle-online')
                .removeClass('status-circle-offline')
                .addClass('status-circle-connecting')
                .removeClass('animated wobble')
                .addClass('animated wobble')
                .attr('data-original-title', connectingMsg)
                .tooltip('show')
                .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                    $(this).removeClass('animated wobble');
                });
            setTimeout(function(){
                jqueryMap.$status_circle.tooltip('hide');
            }, 1500);
        }
        else {
            jqueryMap.$status_circle
                .removeClass('status-circle-online')
                .removeClass('status-circle-connecting')
                .addClass('status-circle-offline')
                .removeClass('animated wobble')
                .addClass('animated wobble')
                .attr('data-original-title', disconnectedMsg)
                .tooltip('show')
                .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                    $(this).removeClass('animated wobble');
                });
            setTimeout(function(){
                jqueryMap.$status_circle.tooltip('hide');
            }, 1500);
        }
    });

    socket.on('price_change', function ( price ) {
        var
            label_class, icon_class, border_class,
            span_element,
            long_price        = price * 100,
            diffFromLastPrice = ( lastPrice - long_price ) / 100;

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
        span_element.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
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

