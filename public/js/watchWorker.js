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
        nameMap = {},

        appendedSheet,

        jqueryMap = {},
        setJqueryMap
        ;
    //----------------- END MODULE SCOPE VARIABLES -------------------

    //--------------------- BEGIN DOM METHODS ------------------------
    setJqueryMap = (function () {
        jqueryMap = { $head : $( 'head' ) };
    })();
    //---------------------- END DOM METHODS -------------------------

    //------------------- BEGIN EVENT LISTENERS ----------------------
    socket.on('reload', function () {
        location.reload( true );
    });
    socket.on('stylesheet', function (sheet) {
        var
            $link = $( '<link rel="stylesheet" type="text/css" media="screen">' ),
            oldSheet;

        if (!nameMap[sheet]) { nameMap[sheet] = sheet; }
        oldSheet = nameMap[sheet];
        console.log(nameMap);

        appendedSheet = sheet + '?' + Date.now();


        $link.attr('href', appendedSheet);

        if ( sheet.indexOf( 'bootstrap' ) >= 0 ) {
            jqueryMap.$head.prepend( $link );
        }
        else {
            jqueryMap.$head.append( $link );
        }

        setTimeout(function() {
            $('link[href="' + oldSheet + '"]').remove();
        }, 1000);

        nameMap[sheet] = appendedSheet;
        console.log(nameMap);
    });
    //-------------------- END EVENT LISTENERS -----------------------
});
