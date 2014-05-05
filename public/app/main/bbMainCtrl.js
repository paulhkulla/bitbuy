/*
 * bbMainCtrl.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.controller('bbMainCtrl', ['$scope', '$document', 'bbIdentity', function($scope, $document, bbIdentity) {

    $scope.isDropdownActive = false;

    var onMouseup = function (e) {
        if (!$('.login-dropdown').is(e.target)// if the target of the click isn't the container...
            && $('.login-dropdown').has(e.target).length === 0 
            && !$('#divSmallBoxes').is(e.target) && $('#divSmallBoxes').has(e.target).length === 0 
            && !$('.icon-user').is(e.target)
            && !$('.login-button').is(e.target) && $('.login-button').has(e.target).length === 0 
            && !$('.register-button').is(e.target) && $('.register-button').has(e.target).length === 0 
            && !($('#myModal').hasClass('in'))) {
                $scope.isDropdownActive = false;
                $scope.$apply();
                $document.unbind('mouseup', onMouseup);
        }
    };

    $scope.minifyMenu = function () {
        $scope.isMinified = $scope.isMinified ? false : true;
    };

    $scope.toggleDropdown = function () {
        if ( bbIdentity.isAuthenticated() ) {
            $scope.isDropdownActive = false;
            $document.unbind('mouseup', onMouseup);
            return;
        }
        $scope.isDropdownActive = $scope.isDropdownActive ? false : true;
        $document.bind('mouseup', onMouseup);
    }; 

    $scope.activateDropdown = function () {
        if ( bbIdentity.isAuthenticated() ) {
            $scope.isDropdownActive = false;
            $document.unbind('mouseup', onMouseup);
            return;
        }
        $scope.isDropdownActive = true;
        $document.bind('mouseup', onMouseup);
    }; 

    $scope.activateTab = function (tab) {
        $scope.activeDropdownTab = tab;
    };

}]);
