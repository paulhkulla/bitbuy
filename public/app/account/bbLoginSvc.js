/*
 * bbLoginSvc.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*global angular, bbApp, $ */

'use strict';

bbApp.factory( 'bbLoginSvc', [
    '$window',
    'bbLoginDropdownSvc',
    'bbIdentitySvc',
    'bbAuthSvc',
    'bbIdleSvc',
    function( $window, bbLoginDropdownSvc, bbIdentitySvc, bbAuthSvc, bbIdleSvc ) {

        return {

            username               : null,
            password               : null,

            isSubmitButtonDisabled : false,

            signin                 : function( username, password, locked ) {

                var title,
                    that = this;

                this.isSubmitButtonDisabled = true;

                bbAuthSvc.authenticateUser( username, password ).then( function( response ) {

                    that.isSubmitButtonDisabled = false;

                    if ( response.success ) {

                        bbIdleSvc.initIdleEvents( bbIdentitySvc.currentUser.token_exp );

                        bbLoginDropdownSvc.isDropdownActive = false;
                        that.username = null;
                        that.password = null;

                        $.smallBox({
                            title : "Tere tulemast tagasi, <strong>" + bbIdentitySvc.currentUser.firstName + "</strong>!",
                            content : "<i>&ldquo;Parim aeg puu istutamiseks oli 20 aastat tagasi. Teine parim aeg on hetkel.&rdquo;</i> <small>-Hiina vanasõna</small>",
                            color : "#96BF48",
                            timeout: 8000,
                            icon : "fa fa-check fadeInLeft animated"
                        });
                    }
                    else {
                        if ( response.info && response.info.message === "User blocked" ) {
                            $.smallBox({
                                title : "Konto ajutiselt blokeeritud!",
                                content : "Teie konto blokeeriti ajutiselt mitme ebaõnnestunud sisselogimiskatse tõttu. Palun oodake või kontakteeruge klienditeenindusega.",
                                color : "#c7262c",
                                timeout: 8000,
                                iconSmall : "fa fa-times shake animated"
                            }); 
                        }
                        else if ( response.info && response.info.message === "User not activated" ) {
                            $.smallBox({
                                title : "Teie konto ei ole aktiveeritud!",
                                content : "Palun aktiveerige enda konto. Kui Te registreerusite saadeti teile e-mail juhenditega. Juhul kui see e-mail peaks kaotsi olema läinud kontakteeruge meie klienditeenindusega.",
                                color : "#c7262c",
                                timeout: 8000,
                                iconSmall : "fa fa-times shake animated"
                            }); 
                        }
                        else if ( response.info && response.info.message === "Missing credentials" ) {
                            $.smallBox({
                                title : "E-mail ja/või parool sisestamata!",
                                content : "Palun sisestage mõlemad!",
                                color : "#c7262c",
                                timeout: 8000,
                                iconSmall : "fa fa-times shake animated"
                            }); 
                        }
                        else {
                            if ( locked ) {
                                title = "Sisestasite vale parooli!"; 
                            }
                            else {
                                title = "Sisestasite vale e-maili ja/või parooli!";
                            }
                            $.smallBox({
                                title : title,
                                content : "Palun proovige uuesti!",
                                color : "#c7262c",
                                timeout: 3000,
                                iconSmall : "fa fa-times shake animated"
                            }); 
                        }
                    }
                });
            },

            signup : function( 
                username,
                password,
                firstName,
                lastName,
                birthday
            ) {

                var 
                    that, 
                    newUserData = {
                        username  : username,
                        password  : password,
                        firstName : firstName,
                        lastName  : lastName,
                        birthday  : birthday
                    };
            
                that = this;
                this.isSubmitButtonDisabled = true;

                bbAuthSvc.createUser( newUserData ).then( function() {
                    that.isSubmitButtonDisabled = false;
                    bbLoginDropdownSvc.isActivationToken = true;
                    $.smallBox({
                        title : "Konto edukalt registreeritud!",
                        content : "Enne kui saate sisse logida palume teil enda konto aktiveerida. Saatsime e-maili juhenditega teie emaili aadressile: " + newUserData.username,
                        color : "#96BF48",
                        timeout: 8000,
                        icon : "fa fa-check fadeInLeft animated"
                    });
                }, function ( reason ) {
                    that.isSubmitButtonDisabled = false;
                    if ( reason === "Error: Duplicate e-mail" ) {
                        $.smallBox({
                            title : "E-mail on juba kasutuses!",
                            content : "Kui tegu on teie e-mailiga, siis palun ärge avage uut kontot.",
                            color : "#c7262c",
                            timeout: 8000,
                            iconSmall : "fa fa-times shake animated"
                        }); 
                    }
                    else {
                        if ( reason ) { reason = "Veateade: " + reason; }
                        else { reason = ""; }
                        $.smallBox({
                            title : "Toiming ebaõnnestus!",
                            content : "Palun proovige uuesti või kontakteeruge klienditeenindusega! " + reason,
                            color : "#c7262c",
                            timeout: 8000,
                            iconSmall : "fa fa-times shake animated"
                        }); 
                    }
                });
            },

            activate      : function( activation_code ) {

                var that = this;

                this.isSubmitButtonDisabled = true;

                bbAuthSvc.checkActivationCode( activation_code ).then( function( response ) {

                    that.isSubmitButtonDisabled = false;

                    if ( response.success ) {

                        bbLoginDropdownSvc.isActivationToken = false;
                        bbLoginDropdownSvc.isDropdownActive = false;
                        $.smallBox({
                            title : "Teie konto on aktiveeritud, <strong>" + bbIdentitySvc.currentUser.firstName + "</strong>!",
                            content : "Täname teid, et liitusite. Anname endast parima ning teeme kõik, et naudiksite siin viibimist!<br><br><i>&ldquo;Parim aeg puu istutamiseks oli 20 aastat tagasi. Teine parim aeg on hetkel.&rdquo;</i> <small>-Hiina vanasõna</small>",
                            color : "#96BF48",
                            timeout: 12000,
                            icon : "fa fa-check fadeInLeft animated"
                        });
                    }
                    else {
                        $.smallBox({
                            title : "Vale aktiveerimiskood!",
                            content : "Palun proovige uuesti!",
                            color : "#c7262c",
                            timeout: 8000,
                            iconSmall : "fa fa-times shake animated"
                        }); 
                    }
                });
            },

            sendReset : function( email ) {

                var that; 
            
                that = this;
                this.isSubmitButtonDisabled = true;

                bbAuthSvc.sendResetEmail( email ).then( function( response ) {

                    that.isSubmitButtonDisabled = false;
                    if ( response.data.success ) {
                        bbLoginDropdownSvc.isResetSent = true;
                        $.smallBox({
                            title : "Toiming õnnestus!",
                            content : "Saatsime e-maili juhenditega teie emaili aadressile: <strong>" + email + "</strong>",
                            color : "#96BF48",
                            timeout: 8000,
                            icon : "fa fa-check fadeInLeft animated"
                        });
                    }
                    else {
                        $.smallBox({
                            title : "Toiming ebaõnnestus!",
                            content : "<strong>" + email + "</strong> ei ole meie lehel registreeritud! Kas tegite vea e-maili sisestamisel? Palun proovige uuesti või kontakteeruge klienditeenindusega!",
                            color : "#c7262c",
                            timeout: 8000,
                            iconSmall : "fa fa-times shake animated"
                        });
                    }
                }, function ( reason ) {
                    that.isSubmitButtonDisabled = false;
                    if ( reason ) { reason = "Veateade: " + reason; }
                    else { reason = ""; }
                    $.smallBox({
                        title : "Toiming ebaõnnestus!",
                        content : "Palun proovige uuesti või kontakteeruge klienditeenindusega! " + reason,
                        color : "#c7262c",
                        timeout: 8000,
                        iconSmall : "fa fa-times shake animated"
                    }); 
                });
            },

            checkResetCode  : function( email, confirmation_code ) {

                var that = this;

                this.isSubmitButtonDisabled = true;

                bbAuthSvc.checkResetCode( email, confirmation_code ).then( function( response ) {

                    that.isSubmitButtonDisabled = false;

                    if ( response.success ) {

                        bbLoginDropdownSvc.isResetConfirmedToken = true;
                        $.smallBox({
                            title : "Parooli muutmine edukalt kinnitatud!",
                            content : "Palun valige nüüd uus parool!",
                            color : "#96BF48",
                            timeout: 12000,
                            icon : "fa fa-check fadeInLeft animated"
                        });
                    }
                    else if ( response.reason === "incorrect code" )  {
                        $.smallBox({
                            title : "Vale kinnituskood!",
                            content : "Palun proovige uuesti!",
                            color : "#c7262c",
                            timeout: 12000,
                            iconSmall : "fa fa-times shake animated"
                        }); 
                    }
                    else if ( response.reason === "expired" )  {
                        $window.sessionStorage.removeItem( 'reset_sent_email' );
                        bbLoginDropdownSvc.isResetSent = false;
                        $.smallBox({
                            title : "Parooli muutmise kinnitamine ebaõnnestus!",
                            content : "Kinnituskood on aegunud. Palun tellige uus kinnitus!",
                            color : "#c7262c",
                            timeout: 12000,
                            iconSmall : "fa fa-times shake animated"
                        }); 
                    }
                    else if ( response.reason === "attempts exceeded" )  {
                        $window.sessionStorage.removeItem( 'reset_sent_email' );
                        bbLoginDropdownSvc.isResetSent = false;
                        $.smallBox({
                            title : "Parooli muutmise kinnitamine ebaõnnestus!",
                            content : "Parooli muutmine läbi kinnituskoodi blokeeritud! Palun kasutage parooli muutmiseks nuppu 'Sätesta uus parool' e-mailis, mille teile saatsime.",
                            color : "#c7262c",
                            timeout: 12000,
                            iconSmall : "fa fa-times shake animated"
                        }); 
                    }
                    else {
                        $window.sessionStorage.removeItem( 'reset_sent_email' );
                        bbLoginDropdownSvc.isResetSent = false;
                        $.smallBox({
                            title : "Esines viga!",
                            content : "Palun tellige uus kinnitus. Probleemi jätkumisel palun kontakteeruge klienditeenindusega.",
                            color : "#c7262c",
                            timeout: 12000,
                            iconSmall : "fa fa-times shake animated"
                        }); 
                    }
                },
                function( rejection ) {
                    $window.sessionStorage.removeItem( 'reset_sent_email' );
                    bbLoginDropdownSvc.isResetSent = false;
                    $.smallBox({
                        title : "Esines viga!",
                        content : "Palun tellige uus kinnitus. Probleemi jätkumisel palun kontakteeruge klienditeenindusega.",
                        color : "#c7262c",
                        timeout: 12000,
                        iconSmall : "fa fa-times shake animated"
                    }); 
                });
            },

            changePw  : function( password ) {

                var that = this;

                this.isSubmitButtonDisabled = true;

                bbAuthSvc.changePw( password ).then( function( response ) {

                    that.isSubmitButtonDisabled = false;

                    if ( response.success ) {
                        bbLoginDropdownSvc.isDropdownActive = false;
                        bbLoginDropdownSvc.isResetSent = false;
                        bbLoginDropdownSvc.isResetConfirmedToken = false;
                        $.smallBox({
                            title : "Parool edukalt muudetud!",
                            content : "Kui soovite võite nüüd enda uue parooliga sisse logida...",
                            color : "#96BF48",
                            timeout: 12000,
                            icon : "fa fa-check fadeInLeft animated"
                        });
                    }
                    else {
                        $.smallBox({
                            title : "Esines viga!",
                            content : "Parooli muutmine ebaõnnestus. Probleemi jätkumisel palun kontakteeruge klienditeenindusega.",
                            color : "#c7262c",
                            timeout: 12000,
                            iconSmall : "fa fa-times shake animated"
                        }); 
                    }
                },
                function( rejection ) {
                    $.smallBox({
                        title : "Esines viga!",
                        content : "Parooli muutmine ebaõnnestus. Probleemi jätkumisel palun kontakteeruge klienditeenindusega.",
                        color : "#c7262c",
                        timeout: 12000,
                        iconSmall : "fa fa-times shake animated"
                    }); 
                });
            },
        };
    }]);
