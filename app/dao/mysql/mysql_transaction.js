var sql_trans_client = module.exports;




function _getNewSqlParamEntity(sql, params, callback) {
    if (callback) {
        return callback(null, {
            sql: sql,
            params: params
        });
    }
    return {
        sql: sql,
        params: params
    };
}




var mysql = require('mysql');
var async = require("async");

// var pomelo = require('pomelo');
// var db=pomelo.app.get('db');


var mysqlConfig;

var pool;
var connection;


sql_trans_client.init=function(app)
{
    mysqlConfig = app.get('mysql');
    pool = mysql.createPool({
        host: mysqlConfig.host,
        user: mysqlConfig.user,
        password: mysqlConfig.password,
        database: mysqlConfig.database,
        connectionLimit: 10,
        port: mysqlConfig.port,
        multipleStatements: false
        // waitForConnections: true

        // host: '127.0.0.1',
        // user: 'liyue',
        // password: 'liyue',
        // database: "huntingground_db",
        // port: "3306"
    });
    return sql_trans_client;
}

sql_trans_client.query=function(sql,param,callback)
{
    pool.getConnection(function(err,conn){  
        if(err){  
            callback(err,null,null);  
        }else{  
            conn.query(sql,param,function(qerr,vals,fields){  
                //释放连接  
                conn.release();  
                //事件驱动回调  
                callback(qerr,vals,fields);  
            });  
        }  
    });  
}; 

// sql_trans_client.getPool=function()
// {
//     return pool;
// }

//callback参数：err,connection
sql_trans_client.getConnection=function(callback)
{
    pool.getConnection(callback);
}


//template
//trans_prog参数一：connection；参数二：成功时的回调，用来commit;参数三，失败时的回调，用来rollback
sql_trans_client.doTransaction = function (trans_prog) {
  pool.getConnection((err_getconn,connection)=>{
        if (err_getconn)
        {
            console.log("database error!");
            return;
        }
        connection.beginTransaction((err_trans)=>{
            if(err_trans)
            {
                console.log("transaction error!");
                return;
            }

            //transaction start
            trans_prog(
                connection,
                (commit_cb)=>{
                    connection.commit((err_commit,info)=>{
                        if(err_commit)
                        {
                            connection.rollback((err_rollback)=>{
                                connection.release();
                                console.log("commit error,rollback!");
                                commit_cb(false);
                                return;
                            });
                        }
                        else
                        {
                            connection.release();
                            console.log("commit finish!");
                            commit_cb(true);
                            return;
                        }
                    })
                },
                (rollback_cb)=>{
                    connection.rollback((err_rollback2)=>{
                        connection.release();
                        console.log("prog error,rollback!");
                        rollback_cb();
                        return;
                    });

                }
            );
            //transaction end
        });
    });
};




// function(err, connection)
// {
//     return pool.getConnection;
//     // pool.getConnection(function (err, connection)
//     // {
//     //     if (err) {
//     //         return callback(err, null);
//     //     }
//     //     this.connection=connection;
//     // }
// }

// sql_trans_client.execTrans=function (sqlparamsEntities, callback) {
//     connection.beginTransaction(function (err) {
//         if (err) {
//             return callback(err, null);
//         }
//         console.log("开始执行transaction，共执行" + sqlparamsEntities.length + "条数据");
//         var funcAry = [];
//         sqlparamsEntities.forEach(function (sql_param) {
//             var temp = function (cb) {
//                 var sql = sql_param.sql;
//                 var param = sql_param.params;
//                 connection.query(sql, param, function (tErr, rows, fields) {
//                     if (tErr) {
//                         connection.rollback(function () {
//                             console.log("事务失败，" + sql_param + "，ERROR：" + tErr);
//                             throw tErr;
//                         });
//                     } else {
//                         return cb(null, 'ok');
//                     }
//                 })
//             };
//             funcAry.push(temp);
//         });

//         async.series(funcAry, function (err, result) {
//             console.log("transaction error: " + err);
//             if (err) {
//                 connection.rollback(function (err) {
//                     console.log("transaction error: " + err);
//                     connection.release();
//                     return callback(err, null);
//                 });
//             } else {
//                 connection.commit(function (err, info) {
//                     console.log("transaction info: " + JSON.stringify(info));
//                     if (err) {
//                         console.log("执行事务失败，" + err);
//                         connection.rollback(function (err) {
//                             console.log("transaction error: " + err);
//                             connection.release();
//                             return callback(err, null);
//                         });
//                     } else {
//                         connection.release();
//                         return callback(null, info);
//                     }
//                 })
//             }
//         })
//     });
// }

