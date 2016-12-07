var dispatcher = require('../../../util/dispatcher');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

var pomelo = require('pomelo');
var db_trans=pomelo.app.get('db_trans');

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next step callback
 *
 */
handler.queryEntry = function(msg, session, next) {

	// var uid = msg.uid;
	// if(!uid) {
	// 	next(null, {
	// 		code: 500
	// 	});
	// 	return;
	// }
	// get all connectors
	var connectors = this.app.getServersByType('connector');
	if(!connectors || connectors.length === 0) {
		next(null, {
			code: 500
			// data:"servers dosn't exist!"
		});
		return;
	}

	// var connectors_return=[];
	// for(var ctr in connectors)
	// {
	// 	connectors_return.push(
	// 			{
	// 				name:connectors[ctr]["name"],
	// 				host:connectors[ctr]["host"],
	// 				port:connectors[ctr]["clientPort"],
	// 				state:0

	// 			}
	// 		);
	// }

	next(null, {
      code: 200,
      // host: res.host,
      // port: res.clientPort
      data:{
		name:connectors[0]["name"],
		host:connectors[0]["host"],
		port:connectors[0]["clientPort"]
      }
    });

    return;

  var routeParam = Math.floor(Math.random() * 10);
  this.app.rpc.time.timeRemote.getCurrentTime(routeParam, "Hello", routeParam, function(hour, min, sec) {
    console.log("Remote Time: " + hour + ":" + min + ":" + sec);
    // select connector, because more than one connector existed.
    var res = dispatcher.dispatch(uid, connectors);
    next(null, {
      code: 200,
      // host: res.host,
      // port: res.clientPort
      data:{
      	host:res.host,
      	port:res.clientPort
      }
    });
  });
};
// handler.queryEntry = function(msg, session, next) {
// 	next(null, {
//       code: 200
//     });
// }
