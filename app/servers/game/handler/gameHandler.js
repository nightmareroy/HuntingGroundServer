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

var uuid=require('uuid');


// var defaultDataManager=require('defaultDataManager');


var gamelib=require('../../../gamelib/game');
var maplib=require('../../../gamelib/map');
var skilllib=require('../../../gamelib/skill');
var rolelib=require('../../../gamelib/role');

// const MultiGameStart="MultiGameStart";
const NextTurn="NextTurn";



// var uuid=require("uuid")

// var utils = require('../util/utils');







//template
handler.template=function(msg, session, next)
{
	var connection;
	var sql;
	var funcs=[];
	funcs.push((cb)=>{
		db.getConnection((err,conn)=>{
			connection=conn;
			cb(err);
		});
	});
	funcs.push((cb)=>{
		connection.beginTransaction((err)=>{
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="";
		connection.query(sql,[],(err,rows)=>{
			cb(err);
		});
	});


	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			connection.rollback((err_rollback)=>{
				connection.release();
				console.log(err);
				next(
					null,
					{
						code:500,
						data:false
					}
				)
			});
		}
		else
		{
			connection.commit((err_commit)=>{
				connection.release();
				next(
					null,
					{
						code:200,
						data:true
					}
				)
			});
			
		}
	});
}


handler.SingleGameStart=function(msg,session,next)
{
	var uid=session.uid;

	//章节id，备用
	var progress_id=msg.progress_id;

	var	creator_id=session.get('creator_id');
	var gamedata_sid=session.get('gamedata_sid');
	var gamechannel_sid=session.get('gamechannel_sid');

	var backendSession;


	if(creator_id!=undefined)
	{
		//already in game
		next(
			null,
			{
				code:500,
				data:false
			}
		)
		return;
	}

	var gameinfo={
		game:{
			creator_id:uid,
			game_name:'single game',
			gametype_id:1,
			progress_id:progress_id//只在单人游戏中才有这个属性
			
		},
		players:{}
	}
	gameinfo.players[uid]={
		uid:uid,
		name:session.get('user_name'),
		group_id:1
	}

	var funcs=[];

	//选择gamedata gamechannel服务器
	funcs.push((cb)=>{
		var gamedataServers = this.app.getServersByType('gamedata');
		var gamechannelServers = this.app.getServersByType('gamechannel');
		gamedata_sid=gamedataServers[gameinfo.game.creator_id%gamedataServers.length].id;
		gamechannel_sid=gamechannelServers[gameinfo.game.creator_id%gamechannelServers.length].id;
		cb();
	});

	//创建游戏数据
	funcs.push((cb)=>{
		this.app.rpc.gamedata.gamedataRemote.CreateGame(gamedata_sid,gameinfo,(gameinfo_t)=>{
			if(gameinfo_t==undefined)
			{
				cb('err');
			}
			else
			{
				// console.log(gameinfo)
				cb();
			}
		});	
	});



	//路由参数绑定到session
	funcs.push((cb)=>{
		session.set('creator_id',uid);
		session.set('gamedata_sid',gamedata_sid);
		session.set('gamechannel_sid',gamechannel_sid);
		session.pushAll(()=>{
			cb();
		});
	});

	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			console.log(err);
			next(
				null,
				{
					code:500,
					data:"start game failed.."
					
				}
			)
		}
		else
		{
			next(
				null,
				{
					code:200,
					data:"start game success,please load game info.."
				}
			)

		}
	});



}

//开始游戏, 此时游戏所有玩家应该都在线,只有房主才能执行
handler.MultiGameStart=function(msg,session,next)
{
	var uid=session.uid;

	var gameinfo_hall;

	var gamedata_sid;
	var gamechannel_sid;

	var sid_dic;


	var funcs=[];




	funcs.push((cb)=>{
		this.app.rpc.gamelist.gamelistRemote.getMultiGameByCreatorId(session,uid,(gameinfo_hall_t)=>{
			if(gameinfo_hall_t==undefined)
			{
				cb('the game is not exist!')
			}
			else
			{
				gameinfo_hall=gameinfo_hall_t;
				cb();
			}
			

		});
	});

	//选择gamedata gamechannel服务器
	funcs.push((cb)=>{
		var gamedataServers = this.app.getServersByType('gamedata');
		var gamechannelServers = this.app.getServersByType('gamechannel');
		gamedata_sid=gamedataServers[gameinfo_hall.game.creator_id%gamedataServers.length].id;
		gamechannel_sid=gamechannelServers[gameinfo_hall.game.creator_id%gamechannelServers.length].id;
		cb();
	});


	//创建游戏数据
	funcs.push((cb)=>{
		this.app.rpc.gamedata.gamedataRemote.CreateGame(gamedata_sid,gameinfo_hall,(gameinfo)=>{
			if(gameinfo==undefined)
			{
				cb('err');
			}
			else
			{
				cb();
			}
		});	
	});



	// funcs.push((cb)=>{
	// 	var sub_funcs=[];
	// 	for(player_id in gameinfo_hall.players)
	// 	{
	// 		(()=>{
				
	// 			var player_id_t=player_id;
	// 			sub_funcs.push((sub_cb)=>{
	// 				sql="insert into active_game_route(uid,creator_id) values (?,?)";
	// 				connection.query(sql,[player_id_t,gameinfo_hall.game.creator_id],(sub_err,sub_rows)=>{
	// 					sub_cb(sub_err);
	// 				});
	// 			});
				
	// 		})();
	// 	}
	// 	async.waterfall(sub_funcs,(err,result)=>{
	// 		cb(err);
	// 	})
	// });

	

	funcs.push((cb)=>{
		//通知玩家游戏开始
		this.app.rpc.gamelist.gamelistRemote.MultiGameStart(session,gameinfo_hall.game.creator_id,gamedata_sid,gamechannel_sid,(err)=>{
			cb(err);
		});		
	});

	// funcs.push((cb)=>{
	// 	//离开游戏大厅
	// 	this.app.rpc.gamelist.gamelistRemote.onMultiLeaveGameHall(session,session.frontendId,uid,(sid_dic_t)=>{
	// 		sid_dic=sid_dic_t;
	// 		cb();
	// 	});
	// });



	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			console.log(err);
			next(
				null,
				{
					code:500,
					data:"start game failed.."
					
				}
			)
		}
		else
		{
			next(
				null,
				{
					code:200,
					data:"start game success,please load game info.."
				}
			)

		}
	});

	

}

//加入游戏频道,并获取游戏数据
handler.LoadGame=function(msg,session,next)
{
	var uid=session.uid;

	
	var gameinfo;

	var	creator_id=session.get('creator_id');
	var gamedata_sid=session.get('gamedata_sid');
	var gamechannel_sid=session.get('gamechannel_sid');

	// console.log(creator_id);
	// console.log(gamedata_sid);
	// console.log(gamechannel_sid);
	if(creator_id==undefined)
	{
		next(
			null,
			{
				code:500,
				data:false
			}
		)
		return;
	}
	

	var gameinfo;

	var funcs=[];

	funcs.push((cb)=>{
		this.app.rpc.gamechannel.gamechannelRemote.EnterGameChannel(gamechannel_sid,uid,creator_id,session.frontendId,(err)=>{
			cb(err);
		})

	});

	funcs.push((cb)=>{
		this.app.rpc.gamedata.gamedataRemote.GetGameInfo(gamedata_sid,creator_id,uid,(gameinfo_t)=>{
			gameinfo=gameinfo_t;
			cb();
		});

	});



	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			console.log(err);
			next(
				null,
				{
					code:500,
					data:false
				}
			)
		}
		else
		{
			next(
				null,
				{
					code:200,
					data:gameinfo
				}
			)
			
		}
	});
}

//下一回合
handler.NextTurn=function(msg,session,next)
{
	var uid=session.uid;

	var	creator_id=session.get('creator_id');
	var gamedata_sid=session.get('gamedata_sid');
	var gamechannel_sid=session.get('gamechannel_sid');

	var direction=msg.direction;
	var current_turn=msg.current_turn;

	if(creator_id==undefined)
	{
		next(
			null,
			{
				code:500,
				data:false
			}
		)
		return;
	}

	var action_list_dic;
	this.app.rpc.gamedata.gamedataRemote.NextTurn(gamedata_sid,creator_id,uid,direction,current_turn,(action_list_dic_t)=>{
		action_list_dic=action_list_dic_t;
		if(action_list_dic==undefined)
		{
			next(
				null,
				{
					code:200,
					data:true
				}
			)
		}
		else
		{
			this.app.rpc.gamechannel.gamechannelRemote.BroadcastActions(gamechannel_sid,creator_id,action_list_dic,()=>{
				next(
					null,
					{
						code:200,
						data:true
					}
				)
			});
		}
	});
	// var funcs=[];
	// funcs.push((cb)=>{
	// 	this.app.rpc.gamedata.gamedataRemote.NextTurn(gamedata_sid,creator_id,uid,direction,current_turn,(action_list_dic_t)=>{
	// 		action_list_dic=action_list_dic_t;
	// 	});
	// });
	// funcs.push((cb)=>{
	// 	if(action_list_dic==undefined)
	// 	{

	// 	}
	// });
}

