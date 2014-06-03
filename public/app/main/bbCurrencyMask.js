/*
 * bbCurrencyMask.js
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

bbApp.directive( 'bbCurrencyMask' , function( $filter, $parse )
{
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, element, attrs, ngModel) {

            function parse(viewValue, noRender) {
                if (!viewValue)
                    return viewValue;

                viewValue = viewValue.toString();
                // strips all non digits leaving periods.
                var clean = viewValue.replace(/[^0-9.]+/g, '').replace(/\.{2,}/, '.');

                // case for users entering multiple periods throughout the number
                var dotSplit = clean.split('.');
                if (dotSplit.length > 2) {
                    clean = dotSplit[0] + '.' + dotSplit[1].slice(0, 2);
                } else if (dotSplit.length == 2) {
                    clean = dotSplit[0] + '.' + dotSplit[1].slice(0, 2);
                }

                if (!noRender)
                    ngModel.$render();
                return clean;
            }

            ngModel.$parsers.unshift(parse);

            ngModel.$render = function() {
                // console.log('viewValue', ngModel.$viewValue);
                // console.log('modelValue', ngModel.$modelValue);
                var clean = parse(ngModel.$viewValue, true);
                if (!clean)
                    return;

                var currencyValue,
                    dotSplit = clean.split('.');

                // todo: refactor, this is ugly
                if (clean[clean.length-1] === '.') {
                     currencyValue = '€' + $filter('number')(parseFloat(clean)) + '.';

                } else if (clean.indexOf('.') != -1 && dotSplit[dotSplit.length - 1].length == 1) {
                    currencyValue = '€' + $filter('number')(parseFloat(clean), 1);
                } else if (clean.indexOf('.') != -1 && dotSplit[dotSplit.length - 1].length == 1) {
                    currencyValue = '€' + $filter('number')(parseFloat(clean), 2);
                } else {
                     currencyValue = '€' + $filter('number')(parseFloat(clean));
                }

                element.val(currencyValue);
            };

        }
    };
});

