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
    setJqueryMap = ( function () {
        jqueryMap = {};
    })();
    //---------------------- END DOM METHODS -------------------------

    //------------------- BEGIN EVENT LISTENERS ----------------------
    socket.on( 'reload', function () {
        location.reload( true );
    });

    socket.on( 'javascript', function ( file ) {
        var
            $script = $( '<script></script>' ),
            oldFile;

        if ( !nameMap[file] ) { nameMap[file] = file; }
        oldFile = nameMap[file];
        console.log( nameMap );

        appendedFile = file + '?' + Date.now();


        $script.attr( 'src', appendedFile );

        $( 'script[src="' + oldFile + '"]' ).before( $script );

        setTimeout( function() {
            $( 'script[src="' + oldFile + '"]' ).remove();
        }, 1000 );

        nameMap[file] = appendedFile;
        console.log( nameMap );
    });

    socket.on( 'stylesheet', function ( sheet ) {
        var
            $link = $( '<link rel="stylesheet" type="text/css" media="screen">' ),
            oldSheet;

        if ( !nameMap[sheet] ) { nameMap[sheet] = sheet; }
        oldSheet = nameMap[sheet];
        console.log( nameMap );

        appendedSheet = sheet + '?' + Date.now();


        $link.attr( 'href', appendedSheet );

        $( 'link[href="' + oldSheet + '"]' ).before( $link );

        setTimeout( function() {
            $( 'link[href="' + oldSheet + '"]' ).remove();
        }, 1000 );

        nameMap[sheet] = appendedSheet;
        console.log( nameMap );
    });
    //-------------------- END EVENT LISTENERS -----------------------
});
