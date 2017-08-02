module.exports = function(app) {
	return new TimeoutRemote(app);
};

var TimeoutRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

// var handler = Handler.prototype;



var logger = require('pomelo-logger').getLogger(__filename);

var gamelib=require('../../../gamelib/game');
var maplib=require('../../../gamelib/map');
var skilllib=require('../../../gamelib/skill');
var rolelib=require('../../../gamelib/role');


var pomelo = require('pomelo');
var async=require('async');
// var db=pomelo.app.get('db');

var defaultDataManager=pomelo.app.get('defaultDataManager');
var uuid=require('uuid');

var timeout_dic={}


var time=180000;
TimeoutRemote.prototype.start_time=function(game_id,gamedata_sid,gamechannel_sid,timeout_sid,cb)
{

	timeout_dic[game_id]={
		timeout:setTimeout(()=>{
			this.app.rpc.gamedata.gamedataRemote.ExecuteDirection(gamedata_sid,gamedata_sid,game_id,gamechannel_sid,timeout_sid,()=>{})
		},time),
		gamedata_sid:gamedata_sid,
		gamechannel_sid:gamechannel_sid
	}
	var timestamp=new Date().getTime();
	console.log('start time');
	cb(time+timestamp);
}

TimeoutRemote.prototype.update_time=function(game_id,gamedata_sid,gamechannel_sid,timeout_sid,cb)
{
	var timeout=timeout_dic[game_id];
	// console.log(game_id)
	// console.log(timeout_dic)
	clearTimeout(timeout.timeout);
	timeout.timeout=setTimeout(()=>{
		// console.log('time out...')
		// this.app.rpc.game.gameRemote.ExecuteDirection(game_id,timeout.gamedata_sid,timeout.gamechannel_sid,()=>{})
		this.app.rpc.gamedata.gamedataRemote.ExecuteDirection(gamedata_sid,gamedata_sid,game_id,gamechannel_sid,timeout_sid,()=>{})
	},time);
	var timestamp=new Date().getTime();
	console.log('update time');
	cb(time+timestamp);
}

TimeoutRemote.prototype.delete_time=function(game_id,cb)
{
	var timeout=timeout_dic[game_id];
	clearTimeout(timeout.timeout);
	delete timeout_dic[game_id];
	console.log('delete time');
	cb();
}


