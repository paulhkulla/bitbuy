/*
* mandrill.js - wrapper for mandrill API calls
*/

/*jslint browser : true, continue : true,
devel          : true, indent   : 4,    maxerr   : 50,
newcap         : true, nomen    : true, plusplus : true,
regexp         : true, sloppy   : true, vars     : false,
white          : true
*/
/*jslint node:true */ 

'use strict';

module.exports = function( config ) {

    var mandrill = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill( config.mandrill_api_key ),

    self = {};

    self.send = function(templateName, fromName, fromEmail, to, replyToEmail, subject, clientName, confirmationToken, confirmationUrl) {
        var
            message = {
                "subject": subject,
                "from_email": fromEmail,
                "from_name": fromName,
                "to": to,
                "headers": {
                    "Reply-To": replyToEmail

                },
                "important": false,
                "merge": true,
                "global_merge_vars": [
                {
                    "name": "name",
                    "content": clientName
                },
                {
                    "name": "activationcode",
                    "content": confirmationToken
                },
                {
                    "name": "activationurl",
                    "content": confirmationUrl
                }
                ],
            },
            
            async = false
            ;

        mandrill_client.messages.sendTemplate({ "template_name": templateName, "template_content": [], "message": message, "async": async }, function(result) {
            console.log('Mandrill API called.');
            console.log(result);

        }, function(e) {
            console.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);

        });

    };

    return self;

};
