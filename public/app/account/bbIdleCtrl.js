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
    'bbIdentitySvc',
    'bbAuthSvc',
    function( $rootScope, $scope, $idle, $modal, bbIdentitySvc, bbAuthSvc ) {
        
        var
            isIdleEventsInit = false,
            initIdleEvents
            ;
            
        $scope.identity = bbIdentitySvc;

        // Setup and initialize idle watch and its events
        initIdleEvents = function( token_exp ) {

            $idle.watch();
            isIdleEventsInit = true;

            $idle._options().warningDuration = token_exp / 1000;

            $scope.events = [];

            $scope.$on( '$idleStart', function() {
                // the user appears to have gone idle                   
                $idle._options().autoResume = false;
                bbAuthSvc.authenticateToken().then( function( success ) {
                    if ( success ) {
                        $scope.warning = $modal.open({
                            templateUrl: 'warning-dialog.html',
                            controller: [ '$rootScope', '$scope', 'bbIdentitySvc', function( $rootScope, $scope, bbIdentitySvc ) {
                                $scope.countdownHumanized = humanizeDuration( bbIdentitySvc.currentUser.token_exp, "et" );
                                $scope.identity = bbIdentitySvc;

                                $scope.$on( '$idleWarn', function( e, countdown ) {
                                    // follows after the $idleStart event, but includes a countdown until the user is considered timed out
                                    // the countdown arg is the number of seconds remaining until then.
                                    // you can change the title or display a warning dialog from here.
                                    // you can let them resume their session by calling $idle.watch()

                                    $scope.countdownHumanized = humanizeDuration( countdown * 1000, "et" );
                                    $scope.countdown = countdown;
                                    $scope.closeIdleModal = function() {
                                        $rootScope.$emit( 'closeIdleModal' );
                                    };

                                });
                            }]
                        });

                        $scope.warning.result.then( null, function( result ) {
                            $idle.watch();
                            $idle._options().autoResume = true;
                        });
                    }

                });

            });

            $scope.$on( '$keepalive', function() {
                // do something to keep the user's session alive
                bbAuthSvc.authenticateToken();
            });

            $rootScope.$on( 'closeIdleModal', function() {
                $scope.warning.dismiss( null );
            });

//             $scope.$on('$idleTimeout', function() {
//                 // the user has timed out (meaning idleDuration + warningDuration has passed without any activity)
//                 // this is where you'd log them
//                 console.log('User has timed out!');
//             });
//
//             $scope.$on('$idleEnd', function() {
//                 // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog 
//                 console.log('User is no longer idle.');
//             });
        };

        $rootScope.$on( 'initIdleEvents', function () {
            if ( ! isIdleEventsInit ) {
                initIdleEvents( bbIdentitySvc.currentUser.token_exp );
            }
        });

    }
]);
