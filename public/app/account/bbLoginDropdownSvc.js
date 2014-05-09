/*
 * bbLoginDropdownSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.factory('bbLoginDropdownSvc', [
    '$rootScope',
    '$document',
    'bbIdentitySvc',
    function( $rootScope, $document, bbIdentitySvc ) {

        var onMouseup = function( e ) {
            if ( !$( '.login-dropdown' ).is( e.target )// if the target of the click isn't the container...
                && $( '.login-dropdown' ).has( e.target ).length === 0 
                && !$( '#divSmallBoxes' ).is( e.target ) && $( '#divSmallBoxes' ).has( e.target ).length === 0 
                && !$( '.icon-user' ).is( e.target )
                && !$( '.login-button' ).is( e.target ) && $( '.login-button' ).has( e.target ).length === 0 
                && !$( '.register-button' ).is( e.target ) && $( '.register-button' ).has( e.target ).length === 0 
                && !( $( '#myModal' ).hasClass( 'in' ) ) ) {
                    e.data.dropdownObj.isDropdownActive = false;
                    $rootScope.$apply();
                    $( $document ).unbind('mouseup', onMouseup);
            }
        };

        return {
            isDropdownActive  : false,

            activeDropdownTab : 'login',

            toggleDropdown    : function() {
                if ( bbIdentitySvc.isAuthenticated() ) {
                    this.isDropdownActive = false;
                    $( $document ).unbind( 'mouseup', onMouseup );
                    return;
                }
                this.isDropdownActive = this.isDropdownActive ? false : true;
                $( $document ).bind( 'mouseup', { dropdownObj : this }, onMouseup );
            },

            activateDropdown  : function() {
                if ( bbIdentitySvc.isAuthenticated() ) {
                    this.isDropdownActive = false;
                    $( $document ).unbind('mouseup', onMouseup);
                    return;
                }
                this.isDropdownActive = true;
                $( $document ).bind( 'mouseup', { dropdownObj : this }, onMouseup );
            }, 

            activateTab       : function( tab ) {
                this.activeDropdownTab = tab;
            }
        };
}]);
