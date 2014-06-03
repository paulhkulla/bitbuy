/*
 * bbCustomSubmit.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

/**
* Custom submit directive that will only submit when all the validation has passed
* for all the fields. This extends on the ng-submit directive provided by AngularJS.
*/

'use strict';

bbApp.directive( 'bbFocusOnClick' , function() {
    return {
        restrict: 'A',
        link: function( scope , element , attributes )
        {
            $( attributes.bbFocusOnClick ).bind( 'click' , function( e ) {
                e.preventDefault();
                element.focus();
                return false;
            });
        }
    };
});

