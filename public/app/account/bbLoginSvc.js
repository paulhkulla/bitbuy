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
    'bbLoginDropdownSvc',
    'bbIdentitySvc',
    'bbAuthSvc',
    'bbIdleSvc',
    function( bbLoginDropdownSvc, bbIdentitySvc, bbAuthSvc, bbIdleSvc ) {

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
                                content : "Palun aktiveerige enda konto. Saatsime teile e-maili juhenditega.",
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
            signup : function ( 
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
                console.log(this.isSubmitButtonDisabled);

                console.log(newUserData);

                bbAuthSvc.createUser( newUserData ).then( function() {
                    that.isSubmitButtonDisabled = false;
                    // success
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
                });
            }
        };
    }]);
