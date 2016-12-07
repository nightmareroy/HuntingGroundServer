module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var handler = Handler.prototype;



var logger = require('pomelo-logger').getLogger(__filename);

var pomelo = require('pomelo');
var async=require('async');
var db=pomelo.app.get('db');


var defaultDataManager=require('../../../defaultdata/defaultDataManager');


var gamelib=require('../../../gamelib/game');
var maplib=require('../../../gamelib/map');
var skilllib=require('../../../gamelib/skill');
var rolelib=require('../../../gamelib/role');





handler.enter_waiting_hall=function(msg,session,next)
{
	// var sessionService=this.app.get('sessionService');
	// var session=sessionService.getByUid(uid)[0];
	var uid=session.uid;

	var channel = this.channelService.getChannel(0, true);

	if( !! channel) {
		channel.add(uid, this.app.get('serverId'));
	}

	this.app.rpc.gamelist.gamelistRemote.getGameDic(session, (gamedic)=>{
		next(null,{
			code:200,
			data:gamedic
		});
	});

	
}

handler.leave_waiting_hall=function(msg,session,next)
{
	var uid=session.uid;

	var channel = this.channelService.getChannel(0, false);

	if( !! channel) {
		channel.leave(uid, this.app.get('serverId'));
	}

	next(null,{
		code:200,
		data:"leave waiting hall!"
	});
}