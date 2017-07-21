var pomelo = require('pomelo');
var dispatcher = require('./app/util/dispatcher');
var abuseFilter = require('./app/servers/chat/filter/abuseFilter');

// route definition for chat server
var chatRoute = function(session, msg, app, cb) {
  var chatServers = app.getServersByType('chat');

	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}

	var res = dispatcher.dispatch(session.get('rid'), chatServers);

	cb(null, res.id);
};

// route for time server

var timeRoute = function(routeParam, msg, app, cb) {
  var timeServers = app.getServersByType('time');
  cb(null, timeServers[routeParam % timeServers.length].id);
}

// var gameRoute = function(routeParam, msg, app, cb) {
//   var userServers = app.getServersByType('game');
//   if(!userServers || userServers.length === 0) {
// 		cb(new Error('can not find chat servers.'));
// 		return;
// 	}

var gamedataRoute=function(sid,msg,app,cb)
{
	// var servers = app.getServersByType('gamedata');
	cb(null,sid);
}

var gamechannelRoute=function(sid,msg,app,cb)
{
	// var servers = app.getServersByType('gamechannel');
	cb(null,sid);
}

var timeoutRoute=function(sid,msg,app,cb)
{
	// var servers = app.getServersByType('gamechannel');
	cb(null,sid);
}

	

// 	// var res = gameServers[0];

// 	// cb(null, res.id);
// 	cb(null,routeParam);
// }

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo-websocket');

// app configure
app.configure('production|development', function() {
	// route configures
	app.route('chat', chatRoute);
  app.route('time', timeRoute);
  // app.route('game',gameRoute);
  app.route('gamedata',gamedataRoute);
  app.route('gamechannel',gamechannelRoute);
  app.filter(pomelo.timeout());
  app.loadConfig('mysql', app.getBase() + '/config/mysql.json');
  // var dbclient = require('./app/dao/mysql/mysql').init(app);
  // app.set('dbclient', dbclient);
  // console.log('333');
  // console.log(app.get('serverId'));
  
	// app.load(pomelo.sync, {path:__dirname + '/app/dao/mapping', dbclient: dbclient});
  // app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient}});

  app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 10,
			timeout:60,
			disconnectOnTimeout:true,
			
			// handshake:handshake,
			// setNoDelay:true,
     
			// enable useDict will make route to be compressed 
			useDict: true,

			// enable useProto
			useProtobuf: true    
		});
  
  var db=require('./app/dao/mysql/mysql_transaction').init(app);
  app.set('db', db);
  
});

// app configuration
app.configure('production|development', 'ddatawriter', function() {

  var defaultDataManager=require('./app/defaultdata/defaultDataManager').init(true);
});

app.configure('production|development', 'game', function() {

  var defaultDataManager=require('./app/defaultdata/defaultDataManager').init();
  app.set('defaultDataManager', defaultDataManager);
});

app.configure('production|development', 'gamedata', function() {
	// var db=require('./app/dao/mysql/mysql_transaction').init(app);
 //  app.set('db', db);
  var defaultDataManager=require('./app/defaultdata/defaultDataManager').init();
  app.set('defaultDataManager', defaultDataManager);

  
});

app.configure('production|development', 'gamelist', function() {
  // var db=require('./app/dao/mysql/mysql_transaction').init(app);
  // app.set('db', db);
  var defaultDataManager=require('./app/defaultdata/defaultDataManager').init();
  app.set('defaultDataManager', defaultDataManager);

  
});

// app.configure('production|development', 'gamedataio', function() {
//   var db=require('./app/dao/mysql/mysql_transaction').init(app);
//   app.set('db', db);
// });


app.configure('production|development', 'connector', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 10,
			timeout:60,
			disconnectOnTimeout:true,
			
			// handshake:handshake,
			// setNoDelay:true,
     
			// enable useDict will make route to be compressed 
			useDict: true,

			// enable useProto
			useProtobuf: true    
		});
});

app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			useDict: true,

      // enable useProto
      useProtobuf: true
		});
});



app.configure('production|development', 'chat', function() {
  app.filter(abuseFilter());
});

// Configure database
app.configure('production|development', 'area|auth|connector|master', function() {
	// var dbclient = require('./app/dao/mysql/mysql').init(app);
	// app.set('dbclient', dbclient);
	// // app.load(pomelo.sync, {path:__dirname + '/app/dao/mapping', dbclient: dbclient});
 //  app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient}});
});



// start app
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});
