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
    'bbAuthSvc',
    'bbLogoutSvc',
    'bbWarningModalSvc',
    function( $rootScope, $idle, bbAuthSvc, bbLogoutSvc, bbWarningModalSvc ) {
        
        var
            initIdleEvents,
            isIdleEventsInit = false;

        // Setup and initialize idle watch and its events
        initIdleEvents = function( token_exp ) {

            console.log( "Idle events init at %s", new moment().format("HH:mm:ss") );

            $idle.watch();
            if ( isIdleEventsInit ) { return; }
            isIdleEventsInit = true;

            $idle._options().warningDuration = token_exp / 1000;

            $rootScope.$on( '$idleStart', function() {

                console.log( "Idle start at %s", new moment().format("HH:mm:ss") );
                bbWarningModalSvc.token_exp           = token_exp / 1000;
                bbWarningModalSvc.countdown           = token_exp / 1000;
                bbWarningModalSvc.countdownHumanized  = humanizeDuration( token_exp, "et" );
                $idle._options().autoResume           = false;

                bbAuthSvc.authenticateToken().then( function( success ) {
                    if ( success ) {
                        bbWarningModalSvc.warningModal();
                        bbWarningModalSvc.warningModalInstance.result.then(
                            function( result ) {},
                            function( result ) {
                                $idle.watch();
                                $idle._options().autoResume = true;
                            }
                        );
                    }

                });

            });

            $rootScope.$on( '$idleWarn', function( e, countdown ) {
                bbWarningModalSvc.countdown          = countdown;
                bbWarningModalSvc.countdownHumanized = humanizeDuration( countdown * 1000, "et" );
            });

            $rootScope.$on('$idleTimeout', function() {
                bbWarningModalSvc.countdown = 0;
                bbWarningModalSvc.warningModalInstance.close( 
                    bbLogoutSvc.signout( "lock_automatically" )
                );
            });

            $rootScope.$on( '$keepalive', function() {
                // do something to keep the user's session alive
                console.log( "Heartbeat at %s", new moment().format("HH:mm:ss") );
                bbAuthSvc.authenticateToken();
            });

        };

        return {
            initIdleEvents : initIdleEvents
        };

    }]);