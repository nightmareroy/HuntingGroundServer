module.exports = {};

var pomelo = require('pomelo');
var db=pomelo.app.get('db');

module.exports.genMap = function (mapsizeid,cb) {
 //  db.getConnection((err_getconn,connection)=>{
	// 	if (err_getconn)
	// 	{
	// 		next(
	// 			null,
	// 			{
	// 				code:500,
	// 				data:"database error!"
	// 			}
	// 		)
	// 		return;
	// 	}

	// 	connection.beginTransaction((err_trans)=>{
	// 		if(err_trans)
	// 		{
	// 			next(
	// 				null,
	// 				{
	// 					code:500,
	// 					data:"transaction error!"
	// 				}
	// 			)
	// 			return;
	// 		}

	// 		//transaction start
	// 		//transaction start
	// 	});
	// });
};
