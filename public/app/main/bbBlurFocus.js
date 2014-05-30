/*
 * bbBlurFocus.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

var bbBlurFocus = function () {
    return {
        restrict: 'E',
        require: '?ngModel',
        link: function (scope, elm, attr, ctrl) {
            if (!ctrl) {
                return;
            }

            elm.on('focus', function () {
                elm.addClass('has-focus');
                $( attr.note ).addClass('has-focus');

                scope.$apply(function () {
                    ctrl.hasFocus = true;
                });
            });

            elm.on('blur', function () {
                elm.removeClass('has-focus');
                elm.addClass('has-visited');
                $( attr.note ).removeClass('has-focus');

                if ( elm.hasClass( "ng-invalid" ) ) {
                    $( attr.note ).addClass('ng-invalid');
                }
                if ( elm.hasClass( "ng-valid" ) ) {
                    $( attr.note ).removeClass('ng-invalid');
                }

                if ( elm.hasClass( "ng-invalid-validator" ) ) {
                    $( attr.validatornote ).addClass('ng-invalid-validator');
                }
                if ( elm.hasClass( "ng-valid-validator" ) ) {
                    $( attr.validatornote ).removeClass('ng-invalid-validator');
                }

                if ( elm.hasClass( "ng-invalid-required" ) ) {
                    $( attr.requirednote ).addClass('ng-invalid-required');
                }
                if ( elm.hasClass( "ng-valid-required" ) ) {
                    $( attr.requirednote ).removeClass('ng-invalid-required');
                }

                if ( elm.hasClass( "ng-invalid-email" ) ) {
                    $( attr.validnote ).addClass('ng-invalid-email');
                }
                if ( elm.hasClass( "ng-valid-email" ) ) {
                    $( attr.validnote ).removeClass('ng-invalid-email');
                }

                if ( elm.hasClass( "ng-invalid-number" ) ) {
                    $( attr.validnote ).addClass('ng-invalid-number');
                }
                if ( elm.hasClass( "ng-valid-number" ) ) {
                    $( attr.validnote ).removeClass('ng-invalid-number');
                }

                scope.$apply(function () {
                    ctrl.hasFocus = false;
                    ctrl.hasVisited = true;
                });
            });

            elm.closest('form').on('submit', function () {
                $( attr.note ).addClass('has-visited');
                if ( elm.hasClass( "ng-invalid" ) ) {
                    $( attr.note ).addClass('ng-invalid');
                }

                scope.$apply(function () {
                    ctrl.hasFocus = false;
                    ctrl.hasVisited = true;
                });
            });

        }
    };
};

bbApp.directive('input', bbBlurFocus);
bbApp.directive('select', bbBlurFocus);
