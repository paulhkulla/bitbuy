/*
 * routes.js - module to provide routing
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global, $, io */

$(function () {

    //---------------- BEGIN MODULE SCOPE VARIABLES ------------------
    var
        socket = io.connect(),

        jqueryMap = {},
        setJqueryMap
        ;
    //----------------- END MODULE SCOPE VARIABLES -------------------

    //--------------------- BEGIN DOM METHODS ------------------------
    setJqueryMap = (function () {
        jqueryMap = {};
    })();
    //---------------------- END DOM METHODS -------------------------

    //------------------- BEGIN EVENT LISTENERS ----------------------

    socket.on('price_change', function ( data ) {
        console.log( data );
    });
    //-------------------- END EVENT LISTENERS -----------------------
});

