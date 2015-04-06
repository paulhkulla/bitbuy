/*
 * config.js
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*jslint node:true */ 

'use strict';

//---------------- BEGIN MODULE SCOPE VARIABLES ------------------
var
    path     = require( 'path' ),
    rootPath = path.normalize( __dirname + '/../../' );
//----------------- END MODULE SCOPE VARIABLES -------------------

module.exports = {
    development: {
        root_path            : rootPath,
        db                  : 'mongodb://jsbox.dev/bitbuy',
        port                : process.env.PORT || 3030,
        token_secret        : 'your token secret',
        encryption_secret   : 'your encryption secret',
        mandrill_api_key    : 'your mandrill key',
        salt_work_factor    : 10,
        max_login_attempts  : 5,
        block_time          : 2 * 60 * 60 * 1000, // 2 hours
        token_expires       : 15 * 60 * 1000, // 15 mins
        reset_token_expires : 20 * 60 * 1000, // 20 minutes
    },
    prod: {
        root_path            : rootPath,
        db                  : 'mongodb://localhost/bitbuy',
        port                : process.env.PORT || 3030,
        token_secret        : 'your token secret',
        encryption_secret   : 'your encryption secret',
        mandrill_api_key    : 'your mandrill key',
        salt_work_factor    : 10,
        max_login_attempts  : 5,
        block_time          : 2 * 60 * 60 * 1000, // 2 hours
        token_expires       : 15 * 60 * 1000, // 15 mins
        reset_token_expires : 20 * 60 * 1000, // 20 minutes
    }
};
