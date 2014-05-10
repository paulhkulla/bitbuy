/*
 * bbIdleSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.factory('bbIdleSvc', [
    '$rootScope',
    '$idle',
    '$modal',
    'bbAuthSvc',
    function( $rootScope, $idle, $modal, bbAuthSvc ) {
        
        var
            initIdleEvents,
            isIdleEventsInit = false,

            warningModal, closeWarningModal
            ;

        closeWarningModal = function() {
            warningModal.dismiss( null );
        };

        // Setup and initialize idle watch and its events
        initIdleEvents = function( token_exp ) {

            $idle.watch();
            isIdleEventsInit = true;

            $idle._options().warningDuration = token_exp / 1000;

            $rootScope.$on( '$idleStart', function() {
                // the user appears to have gone idle                   
                $idle._options().autoResume = false;
                bbAuthSvc.authenticateToken().then( function( success ) {
                    if ( success ) {
                        warningModal = $modal.open({
                            templateUrl: '/app/account/warning-modal.html',
                            controller: [ '$rootScope', '$scope', 'bbIdentitySvc', 'bbIdleSvc', function( $rootScope, $scope, bbIdentitySvc, bbIdleSvc ) {

                                $scope.countdownHumanized = humanizeDuration( bbIdentitySvc.currentUser.token_exp, "et" );
                                $scope.identity           = bbIdentitySvc;

                                $scope.$on( '$idleWarn', function( e, countdown ) {

                                    $scope.countdownHumanized = humanizeDuration( countdown * 1000, "et" );
                                    $scope.countdown          = countdown;
                                    $scope.closeIdleModal     = function() {
                                        bbIdleSvc.closeWarningModal();
                                    };

                                });

                                $scope.$on('$idleTimeout', function() {
                                    $scope.countdown = 0;
                                });
                            }]
                        });

                        warningModal.result.then( null, function( result ) {
                            $idle.watch();
                            $idle._options().autoResume = true;
                        });
                    }

                });

            });

            $rootScope.$on( '$keepalive', function() {
                // do something to keep the user's session alive
                bbAuthSvc.authenticateToken();
            });

        };

        return {
            initIdleEvents    : initIdleEvents,
            closeWarningModal : closeWarningModal,
            isIdleEventsInit  : isIdleEventsInit
        };

    }]);
