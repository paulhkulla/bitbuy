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

bbApp.directive( 'bbCustomSubmit' , function()
{
    return {
        restrict: 'A',
        link: function( scope , element , attributes )
        {
            var $element = angular.element(element);
            $element.bind( 'submit' , function( e ) {
                e.preventDefault();
                // Get the form object.
                var form = scope[ attributes.name ];

                // Do not continue if the form is invalid.
                if ( form.$invalid ) {
                    // Focus on the first field that is invalid.
                    $element.find( '.ng-invalid' ).first().focus();
                    return false;
                }
                // From this point and below, we can assume that the form is valid.
                scope.$eval( attributes.bbCustomSubmit );
            });
        }
    };
});

