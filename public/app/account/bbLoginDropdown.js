/*
 * bbLoginDropdown.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp */

'use strict';

bbApp.directive("bbLoginDropdown", function( $timeout ) {
    return {
        restrict    : 'A',
        templateUrl : '/app/account/login-dropdown.html',
        controller  : 'bbLoginDropdownCtrl',
        link        : function ( scope, element, attributes ) {
            scope.$watch( function() { return scope.bbLoginDropdownSvc; }, function( newValue, oldValue ) {
                console.log(newValue);
                if ( newValue.isDropdownActive && newValue.activeDropdownTab === "login" ) {
                    $timeout( function() {
                        if ( ! $( element ).find( "#dropdown-username" ).val() ) {
                            $( element ).find( "#dropdown-username" ).focus();
                        }
                    });
                }
            }, true);
        }
    };
});
