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
GameRemote.prototype.OnUserLeave=function(creator_id,gamedata_sid,gamechannel_sid,uid,callback)
{
	var result;

	var funcs=[];
	funcs.push((cb)=>{
		this.app.rpc.gamedata.gamedataRemote.FailGame(gamedata_sid,creator_id,uid,(result_t)=>{
			result=result_t;
			cb();
		});
	});
	funcs.push((cb)=>{
		//游戏尚未结束
		if(result==undefined)
		{
			this.app.rpc.gamechannel.gamechannelRemote.LeaveGameChannel(gamechannel_sid,uid,()=>{
				cb();
			});
		}
		//游戏结束
		else
		{
			this.app.rpc.gamechannel.gamechannelRemote.GameOver(gamechannel_sid,creator_id,()=>{
				cb();
			});
		}
		
	});
	async.waterfall(funcs,(err,result)=>{
		callback(err);
	})
}








