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

        var onMousedown = function( e ) {
            if ( !$( '.login-dropdown' ).is( e.target )// if the target of the click isn't the container...
                && $( '.login-dropdown' ).has( e.target ).length === 0 
                && !$( '#divSmallBoxes' ).is( e.target ) && $( '#divSmallBoxes' ).has( e.target ).length === 0 
                && !$( '.icon-user' ).is( e.target )
                && !$( '.login-button' ).is( e.target ) && $( '.login-button' ).has( e.target ).length === 0 
                && !$( '.register-button' ).is( e.target ) && $( '.register-button' ).has( e.target ).length === 0 
                && !( $( '.modal-tos' ).hasClass( 'in' ) )  
                && !( $( '.modal-na' ).hasClass( 'in' ) ) ) {
                    e.data.dropdownObj.isDropdownActive = false;
                    $rootScope.$apply();
                    $( $document ).unbind( 'mousedown', onMousedown );
            }
        };

        return {
            isDropdownActive      : false,

            isActivationToken     : false,

            isResetSent           : false,

            isResetConfirmedToken : false,

            activeDropdownTab     : 'login',

            toggleDropdown        : function() {
                if ( bbIdentitySvc.currentUser ) {
                    this.isDropdownActive = false;
                    $( $document ).unbind( 'mousedown', onMousedown );
                    return;
                }
                this.isDropdownActive = this.isDropdownActive ? false : true;
                if ( this.isDropdownActive ) {
                    $( $document ).bind( 'mousedown', { dropdownObj : this }, onMousedown );
                }
                else {
                    $( $document ).unbind( 'mousedown', onMousedown );
                }
            },

            activateDropdown  : function() {
                if ( bbIdentitySvc.currentUser ) {
                    this.isDropdownActive = false;
                    $( $document ).unbind( 'mousedown', onMousedown );
                    return;
                }
                this.isDropdownActive = true;
                $( $document ).bind( 'mousedown', { dropdownObj : this }, onMousedown );
            }, 

            activateTab       : function( tab ) {
                this.activeDropdownTab = tab;
            }
        };
}]);
