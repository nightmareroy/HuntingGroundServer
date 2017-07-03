module.exports = function(app) {
	return new GameRemote(app);
};

var GameRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var logger = require('pomelo-logger').getLogger(__filename);

var pomelo = require('pomelo');
var async=require('async');
var db=pomelo.app.get('db');


var defaultDataManager=require('../../../defaultdata/defaultDataManager');


var gamelib=require('../../../gamelib/game');
var maplib=require('../../../gamelib/map');
var skilllib=require('../../../gamelib/skill');
var rolelib=require('../../../gamelib/role');


var userChannelDic={};

const DoAction="DoAction";
const PlayerFail="PlayerFail";

//游戏数据判输，离开频道
GameRemote.prototype.OnUserLeave=function(creator_id,gamedata_sid,gamechannel_sid,timeout_sid,uid,callback)
{
	var gameinfo;

	var funcs=[];
	funcs.push((cb)=>{
		this.app.rpc.gamedata.gamedataRemote.LeaveGame(gamedata_sid,creator_id,uid,(result_t)=>{
			gameinfo=result_t;
			cb();
		});
	});

	funcs.push((cb)=>{
		this.app.rpc.gamechannel.gamechannelRemote.LeaveGameChannel(gamechannel_sid,uid,()=>{
			cb();
		});
	});


	funcs.push((cb)=>{
		var gameover=gamelib.get_gameover(gameinfo);
		// 
		// console.log(gameover)
		if(!!gameover)
		{
			this.app.rpc.gamechannel.gamechannelRemote.GameOver(gamechannel_sid,gameinfo.game.creator_id,gameover,()=>{});
			this.app.rpc.timeout.timeoutRemote.delete_time(timeout_sid,creator_id,()=>{});
			cb();
		}
		else
		{
			cb();
		}


			
		
	});
	async.waterfall(funcs,(err,result)=>{
		callback(err);
	})
}


// GameRemote.prototype.ExecuteDirection=function(creator_id,gamedata_sid,gamechannel_sid,timeout_sid,cb)
// {
// 	this.app.rpc.gamedata.gamedataRemote.ExecuteDirection(gamedata_sid,creator_id,(result)=>{
// 		this.app.rpc.gamechannel.gamechannelRemote.BroadcastActions(gamechannel_sid,creator_id,result.action_list_dic,()=>{

// 		});
// 		if(!!result.gameover)
// 		{
// 			this.app.rpc.gamechannel.gamechannelRemote.GameOver(gamechannel_sid,creator_id,result.gameover,()=>{});
// 			this.app.rpc.timeout.timeoutRemote.delete_time(timeout_sid,creator_id,()=>{});
// 		}
// 		else
// 		{
// 			this.app.rpc.timeout.timeoutRemote.update_time(timeout_sid,creator_id,()=>{});
// 		}
// 		cb();
// 	})
// }







