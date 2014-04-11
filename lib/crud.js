/*
 * crud.js - module to do CRUD
 */

/*jslint browser : true, continue : true,
  devel          : true, indent   : 4,    maxerr   : 50,
  newcap         : true, nomen    : true, plusplus : true,
  regexp         : true, sloppy   : true, vars     : false,
  white          : true
*/
/*jslint node:true */ 
/*global */

//---------------- BEGIN MODULE SCOPE VARIABLES ------------------
'use strict';
var
    loadSchema , checkSchema, checkType,
    constructObj, readObj, getLast,

    mongodb  = require( 'mongodb' ),
    fsHandle = require( 'fs' ),
    JSV      = require( 'JSV' ).JSV,
    events   = require('events'),

    mongoServer = new mongodb.Server(
        'jsbox.dev',
        mongodb.Connection.DEFAULT_PORT
    ),

    dbHandle = new mongodb.Db(
        'bitbuy', mongoServer, { safe : true }
    ),

    validator = JSV.createEnvironment(),

    eventEmitter = new events.EventEmitter(),

    objTypeMap  = { 'asks': {}, 'bids': {} };
//----------------- END MODULE SCOPE VARIABLES -------------------

//------------------- BEGIN UTILITY METHODS ----------------------
loadSchema = function ( schema_name, schema_path ) {
    fsHandle.readFile( schema_path, 'utf8', function ( err, data ) { 
        objTypeMap[ schema_name ] = JSON.parse( data );
    });
};

checkSchema = function ( obj_type, obj_map, callback ) {
    var
        schema_map = objTypeMap[ obj_type ],
        report_map = validator.validate( obj_map, schema_map );

    callback( report_map.errors );
};

//-------------------- END UTILITY METHODS -----------------------

//-------------------- BEGIN PUBLIC METHODS ----------------------
checkType = function ( obj_type ) {
    if ( ! objTypeMap[ obj_type ] ) {
        return ({ error_msg : 'Object type "' + obj_type
            + '" is not supported.'
        });
    }
    return null;
};
constructObj = function ( obj_type, obj_map, callback ) {
    var type_check_map = checkType( obj_type );
    if ( type_check_map ) {
        callback( type_check_map );
        return;
    }
    checkSchema(
        obj_type, obj_map,
        function ( error_list ) {
            if ( error_list.length === 0 ) {
                dbHandle.collection(
                    obj_type,
                    function ( outer_error, collection ) {
                        var options_map = { safe : true };

                        collection.insert(
                            obj_map,
                            options_map,
                            function ( inner_error, result_map ) {
                                callback( result_map );
                            }
                        );
                    }
                );
            }
            else {
                callback({
                    error_msg  : 'Input document not valid',
                    error_list : error_list
                });
            }
        }
    );
};

readObj = function ( obj_type, find_map, fields_map, callback ) {
    var type_check_map = checkType( obj_type );
    if ( type_check_map ) {
        callback( type_check_map );
        return;
    }

    dbHandle.collection(
        obj_type,
        function ( outer_error, collection ) {
            collection.find( find_map, fields_map ).toArray(
                function ( inner_error, map_list ) {
                    callback( map_list );
                }
            );
        }
    );
};

getLast = function ( obj_type, fields_map, callback ) {
    var type_check_map = checkType( obj_type );
    if ( type_check_map ) {
        callback( type_check_map );
        return;
    }

    dbHandle.collection(
        obj_type,
        function ( outer_error, collection ) {
            collection.findOne(
                {},
                {sort:{ "_id" : -1 }},
                function ( inner_error, map_list ) {
                    callback( map_list );
                }
            );
        }
    );
};

module.exports = {
    makeMongoId  : mongodb.ObjectID,
    checkType    : checkType,
    construct    : constructObj,
    read         : readObj,
    getLast      : getLast,
    eventEmitter : eventEmitter
};
//--------------------- END PUBLIC METHODS -----------------------

//---------------- BEGIN MODULE INITIALIZATION -------------------
console.log( '** CRUD module loaded **' );
//----------------- END MODULE INITIALIZATION --------------------

//----------------- BEGIN MODULE INITILIZATION -------------------
dbHandle.open( function () {
    console.log( '** Connected to MongoDB **' );
    eventEmitter.emit('connectedToMongo');
});

// load schemas into memory (objTypeMap)
(function () {
    var schema_name, schema_path;
    for ( schema_name in objTypeMap ) {
        if ( objTypeMap.hasOwnProperty( schema_name ) ) {
            schema_path = __dirname + '/' + schema_name + '.json';
            loadSchema( schema_name, schema_path );
        }
    }
}());
//------------------ END MODULE INITILIZATION --------------------
