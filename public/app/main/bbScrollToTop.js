/*
 * bbScrollToTop.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.directive( 'bbScrollToTop' , [ '$window', function( $window ) {
    return {
        restrict: 'A',
        link: function( scope , element , attributes )
        {
            $( element ).bind( 'click' , function( e ) {
                e.preventDefault();
                $("html, body").animate({ scrollTop: 0  }, "slow");
            });
        }
    };
}]);

