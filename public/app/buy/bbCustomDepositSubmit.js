/*
 * bbCustomDepositSubmit.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.directive( 'bbCustomDepositSubmit' , [ 'bbBuySvc', function( bbBuySvc ) {
    return {
        restrict: 'A',
        require: '^form',
        link: function( scope , element , attributes, formCtrl )
        {
            var $element = angular.element(element);
            $( attributes.bbSubmitButton ).unbind( 'click' );
            $( attributes.bbSubmitButton ).bind( 'click' , function( e ) {
                e.preventDefault();

                console.log( formCtrl );
                // Do not continue if the form is invalid.
                if ( formCtrl.$invalid ) {
                    bbBuySvc.isChangeDepositAmount = true;
                    scope.$apply();
                    // Focus on the first field that is invalid.
                    $element.find( '.ng-invalid' ).first().focus();
                    console.log($( attributes.bbScrollTo ));
                    $('html, body').animate({
                        scrollTop: $( attributes.bbScrollTo ).offset().top - 160
                    }, "slow");
                    return false;
                }
                scope.$eval( attributes.bbCustomDepositSubmit );
            });
        }
    };
}]);

