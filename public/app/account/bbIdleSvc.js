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
    'bbWarningModalSvc',
    function( $rootScope, $idle, $modal, bbAuthSvc, bbWarningModalSvc ) {
        
        var
            initIdleEvents,
            isIdleEventsInit = false,

            warningModal, closeWarningModal
            ;

        // Setup and initialize idle watch and its events
        initIdleEvents = function( token_exp ) {

            $idle.watch();
            isIdleEventsInit = true;

            $idle._options().warningDuration = token_exp / 1000;

            $rootScope.$on( '$idleStart', function() {

                bbWarningModalSvc.token_exp           = token_exp / 1000;
                bbWarningModalSvc.countdown           = token_exp / 1000;
                bbWarningModalSvc.countdownHumanized  = humanizeDuration( token_exp, "et" );
                $idle._options().autoResume           = false;

                bbAuthSvc.authenticateToken().then( function( success ) {
                    if ( success ) {
                        warningModal = bbWarningModalSvc.warningModal();
                        warningModal.result.then( null, function( result ) {
                            $idle.watch();
                            $idle._options().autoResume = true;
                        });
                    }

                });

            });

            $rootScope.$on( '$idleWarn', function( e, countdown ) {
                console.log("trigger");
                bbWarningModalSvc.countdown          = countdown;
                bbWarningModalSvc.countdownHumanized = humanizeDuration( countdown * 1000, "et" );
            });

            $rootScope.$on('$idleTimeout', function() {
                bbWarningModalSvc.countdown          = 0;
            });

            $rootScope.$on( '$keepalive', function() {
                // do something to keep the user's session alive
                bbAuthSvc.authenticateToken();
            });

        };

        closeWarningModal = function() {
            warningModal.dismiss( null );
        };

        return {
            initIdleEvents    : initIdleEvents,
            closeWarningModal : closeWarningModal,
            isIdleEventsInit  : isIdleEventsInit
        };

    }]);
