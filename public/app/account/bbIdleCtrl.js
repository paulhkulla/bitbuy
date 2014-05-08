/*
 * bbLoginCtrl.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.controller('bbIdleCtrl', [
    '$rootScope',
    '$scope',
    '$idle',
    '$modal',
    'bbIdentity',
    'bbAuth',
    function( $rootScope, $scope, $idle, $modal, bbIdentity, bbAuth ) {
        
        var
            isIdleEventsInit = false,
            initIdleEvents, closeModals;
            
        $scope.identity = bbIdentity;

        closeModals = function() {
            if ($scope.warning) {
                $scope.warning.close();
                $scope.warning = null;
            }
        };

        // Setup and initialize idle watch and its events
        initIdleEvents = function( token_exp ) {

            isIdleEventsInit = true;

            $idle._options().warningDuration = token_exp / 1000;
            $idle._options().autoResume = false;

            $scope.events = [];

            $scope.$on('$idleStart', function() {
                // the user appears to have gone idle                   
                console.log('User is idle');
                bbAuth.authenticateToken().then( function( success ) {
                    if ( success ) {
                        closeModals();

                        $scope.warning = $modal.open({
                            templateUrl: 'warning-dialog.html',
                            backdrop: 'static',
                            size: 'sm',
                            controller: [ '$scope', 'bbIdentity', function( $scope, bbIdentity ) {
                                $scope.countdownHumanized = humanizeDuration( bbIdentity.currentUser.token_exp, "et" );
                                $scope.identity = bbIdentity;

                                $scope.$on('$idleWarn', function(e, countdown) {
                                    // follows after the $idleStart event, but includes a countdown until the user is considered timed out
                                    // the countdown arg is the number of seconds remaining until then.
                                    // you can change the title or display a warning dialog from here.
                                    // you can let them resume their session by calling $idle.watch()
                                    console.log('Warning! User about to get timed out!');

                                    $scope.countdownHumanized = humanizeDuration( countdown * 1000, "et" );
                                    $scope.countdown = countdown;
                                });
                            }]
                        });

                    }

                });

            });

            $scope.$on('$idleTimeout', function() {
                // the user has timed out (meaning idleDuration + warningDuration has passed without any activity)
                // this is where you'd log them
                console.log('User has timed out!');
            });

            $scope.$on('$idleEnd', function() {
                // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog 
                console.log('User is no longer idle.');
                closeModals();
            });

            $scope.$on('$keepalive', function() {
                // do something to keep the user's session alive
                console.log('Heartbeat...');
                bbAuth.authenticateToken();
            });
        };

        $rootScope.$on('initIdleEvents', function () {
            if ( ! isIdleEventsInit ) {
                initIdleEvents( bbIdentity.currentUser.token_exp );
            }
        });

    }
]);
