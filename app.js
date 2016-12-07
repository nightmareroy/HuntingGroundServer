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

var userRoute = function(routeParam, msg, app, cb) {
  var userServers = app.getServersByType('user');
  if(!userServers || userServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}

	var res = userServers[0];//dispatcher.dispatch(session.get('rid'), userServers);

	cb(null, res.id);
}

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
  app.route('user',userRoute);
  app.filter(pomelo.timeout());
  app.loadConfig('mysql', app.getBase() + '/config/mysql.json');
  // var dbclient = require('./app/dao/mysql/mysql').init(app);
  // app.set('dbclient', dbclient);

  var db=require('./app/dao/mysql/mysql_transaction').init(app);
  app.set('db', db);
	// app.load(pomelo.sync, {path:__dirname + '/app/dao/mapping', dbclient: dbclient});
  // app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient}});
  var defaultDataManager=require('./app/defaultdata/defaultDataManager').init();
  
});



// app configuration
app.configure('production|development', 'connector', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 1,
			// timeout:5,
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
