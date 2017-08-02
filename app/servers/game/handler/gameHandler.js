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
	// var single_game_info=defaultDataManager.get_d_single_game_info(progress_id);

	var	game_id=session.get('game_id');
	var gamedata_sid;//=session.get('gamedata_sid');
	var gamechannel_sid;//=session.get('gamechannel_sid');
	var timeout_sid;

	var backendSession;


	if(!game_id)
	{
		//
		next(
			null,
			{
				code:500,
				data:'未登录'
			}
		)
		return;
	}
	else if(game_id!=-1)
	{
		//
		next(
			null,
			{
				code:500,
				data:'已在游戏中'
			}
		)
		return;
	}

	game_id=uuid.v1();

	var gameinfo={
		game:{
			game_id:game_id,
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
		group_id:1,
		actived_food_ids:session.get('actived_food_ids')
	}

	var funcs=[];

	//选择gamedata gamechannel timeout服务器
	funcs.push((cb)=>{
		var gamedataServers = this.app.getServersByType('gamedata');
		var gamechannelServers = this.app.getServersByType('gamechannel');
		var timeoutServers=this.app.getServersByType('timeout');
		gamedata_sid=gamedataServers[gameinfo.game.creator_id%gamedataServers.length].id;
		gamechannel_sid=gamechannelServers[gameinfo.game.creator_id%gamechannelServers.length].id;
		timeout_sid=timeoutServers[gameinfo.game.creator_id%timeoutServers.length].id;
		gameinfo.game.gamedata_sid=gamedata_sid;
		gameinfo.game.gamechannel_sid=gamechannel_sid;
		gameinfo.game.timeout_sid=timeout_sid;
		cb();
	});

	//加入计时器
	funcs.push((cb)=>{
		this.app.rpc.timeout.timeoutRemote.start_time(timeout_sid,game_id,gamedata_sid,gamechannel_sid,timeout_sid,(nexttime)=>{
			gameinfo.game.nexttime=nexttime;
			cb();
		})
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
		// console.log(creator_id);
		// console.log(gamedata_sid);
		// console.log(gamechannel_sid);
		// console.log(timeout_sid);
		session.set('game_id',game_id);
		session.set('gamedata_sid',gamedata_sid);
		session.set('gamechannel_sid',gamechannel_sid);
		session.set('timeout_sid',timeout_sid);
		session.pushAll(()=>{
			cb();
		});
	});

	//创建并加入游戏频道
	// funcs.push((cb)=>{
	// 	this.app.rpc.gamechannel.gamechannelRemote.CreateGameChannel(gamechannel_sid,gameinfo,()=>{
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


handler.PvEGameStart=function(msg,session,next)
{
	var uid=session.uid;


	// var single_game_info=defaultDataManager.get_d_single_game_info(progress_id);

	var	game_id=session.get('game_id');
	var gamedata_sid;//=session.get('gamedata_sid');
	var gamechannel_sid;//=session.get('gamechannel_sid');
	var timeout_sid;

	var backendSession;



	if(!game_id)
	{
		//
		next(
			null,
			{
				code:500,
				data:'未登录'
			}
		)
		return;
	}
	else if(game_id!=-1)
	{
		//
		next(
			null,
			{
				code:500,
				data:'已在游戏中'
			}
		)
		return;
	}

	game_id=uuid.v1();
	var gameinfo={
		game:{
			game_id:game_id,
			creator_id:uid,
			game_name:'pve game',
			gametype_id:4
			
		},
		players:{}
	}
	gameinfo.players[uid]={
		uid:uid,
		name:session.get('user_name'),
		group_id:1,
		actived_food_ids:session.get('actived_food_ids')
	}
	gameinfo.players[-1]={
		uid:-1,
		name:"倭黑猩猩家",
		group_id:-1,
		actived_food_ids:[1,2,3,4,5,6,7]
	}
	gameinfo.players[-2]={
		uid:-2,
		name:"红毛猩猩家",
		group_id:-2,
		actived_food_ids:[1,2,3,4,5,6,7]
	}
	gameinfo.players[-101]={
		uid:-101,
		name:"棕熊家",
		group_id:-101,
		actived_food_ids:[2,5]
	}

	var funcs=[];

	//选择gamedata gamechannel timeout服务器
	funcs.push((cb)=>{
		var gamedataServers = this.app.getServersByType('gamedata');
		var gamechannelServers = this.app.getServersByType('gamechannel');
		var timeoutServers=this.app.getServersByType('timeout');
		gamedata_sid=gamedataServers[gameinfo.game.creator_id%gamedataServers.length].id;
		gamechannel_sid=gamechannelServers[gameinfo.game.creator_id%gamechannelServers.length].id;
		timeout_sid=timeoutServers[gameinfo.game.creator_id%timeoutServers.length].id;
		gameinfo.game.gamedata_sid=gamedata_sid;
		gameinfo.game.gamechannel_sid=gamechannel_sid;
		gameinfo.game.timeout_sid=timeout_sid;
		cb();
	});

	//加入计时器
	funcs.push((cb)=>{
		console.log(game_id)
		this.app.rpc.timeout.timeoutRemote.start_time(timeout_sid,game_id,gamedata_sid,gamechannel_sid,timeout_sid,(nexttime)=>{
			gameinfo.game.nexttime=nexttime;
			cb();
		})
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
		// console.log(creator_id);
		// console.log(gamedata_sid);
		// console.log(gamechannel_sid);
		// console.log(timeout_sid);
		session.set('game_id',game_id);
		session.set('gamedata_sid',gamedata_sid);
		session.set('gamechannel_sid',gamechannel_sid);
		session.set('timeout_sid',timeout_sid);
		session.pushAll(()=>{
			cb();
		});
	});

	//创建并加入游戏频道
	// funcs.push((cb)=>{
	// 	this.app.rpc.gamechannel.gamechannelRemote.CreateGameChannel(gamechannel_sid,gameinfo,()=>{
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




//开始游戏, 此时游戏所有玩家应该都在线,只有房主才能执行
// handler.MultiGameStart=function(msg,session,next)
// {
// 	var uid=session.uid;

// 	var gameinfo_hall;

// 	var gamedata_sid;
// 	var gamechannel_sid;

// 	var sid_dic;


// 	var funcs=[];




// 	funcs.push((cb)=>{
// 		this.app.rpc.gamelist.gamelistRemote.getMultiGameByCreatorId(session,uid,(gameinfo_hall_t)=>{
// 			if(gameinfo_hall_t==undefined)
// 			{
// 				cb('the game is not exist!')
// 			}
// 			else
// 			{
// 				gameinfo_hall=gameinfo_hall_t;
// 				cb();
// 			}
			

// 		});
// 	});

// 	//选择gamedata gamechannel服务器
// 	funcs.push((cb)=>{
// 		var gamedataServers = this.app.getServersByType('gamedata');
// 		var gamechannelServers = this.app.getServersByType('gamechannel');
// 		gamedata_sid=gamedataServers[gameinfo_hall.game.creator_id%gamedataServers.length].id;
// 		gamechannel_sid=gamechannelServers[gameinfo_hall.game.creator_id%gamechannelServers.length].id;
// 		cb();
// 	});


// 	//创建游戏数据
// 	funcs.push((cb)=>{
// 		this.app.rpc.gamedata.gamedataRemote.CreateGame(gamedata_sid,gameinfo_hall,(gameinfo)=>{
// 			if(gameinfo==undefined)
// 			{
// 				cb('err');
// 			}
// 			else
// 			{
// 				cb();
// 			}
// 		});	
// 	});



// 	// funcs.push((cb)=>{
// 	// 	var sub_funcs=[];
// 	// 	for(player_id in gameinfo_hall.players)
// 	// 	{
// 	// 		(()=>{
				
// 	// 			var player_id_t=player_id;
// 	// 			sub_funcs.push((sub_cb)=>{
// 	// 				sql="insert into active_game_route(uid,creator_id) values (?,?)";
// 	// 				connection.query(sql,[player_id_t,gameinfo_hall.game.creator_id],(sub_err,sub_rows)=>{
// 	// 					sub_cb(sub_err);
// 	// 				});
// 	// 			});
				
// 	// 		})();
// 	// 	}
// 	// 	async.waterfall(sub_funcs,(err,result)=>{
// 	// 		cb(err);
// 	// 	})
// 	// });

	

// 	funcs.push((cb)=>{
// 		//通知玩家游戏开始
// 		this.app.rpc.gamelist.gamelistRemote.MultiGameStart(session,gameinfo_hall.game.creator_id,gamedata_sid,gamechannel_sid,(err)=>{
// 			cb(err);
// 		});		
// 	});

// 	// funcs.push((cb)=>{
// 	// 	//离开游戏大厅
// 	// 	this.app.rpc.gamelist.gamelistRemote.onMultiLeaveGameHall(session,session.frontendId,uid,(sid_dic_t)=>{
// 	// 		sid_dic=sid_dic_t;
// 	// 		cb();
// 	// 	});
// 	// });



// 	async.waterfall(funcs,(err,result)=>{
// 		if(err)
// 		{
// 			console.log(err);
// 			next(
// 				null,
// 				{
// 					code:500,
// 					data:"start game failed.."
					
// 				}
// 			)
// 		}
// 		else
// 		{
// 			next(
// 				null,
// 				{
// 					code:200,
// 					data:"start game success,please load game info.."
// 				}
// 			)

// 		}
// 	});

	

// }

//加入游戏频道,并获取游戏数据
handler.LoadGame=function(msg,session,next)
{
	var uid=session.uid;

	
	var gameinfo;

	var	game_id=session.get('game_id');
	var gamedata_sid=session.get('gamedata_sid');
	var gamechannel_sid=session.get('gamechannel_sid');

	// console.log(creator_id);
	// console.log(gamedata_sid);
	// console.log(gamechannel_sid);
	if(!game_id)
	{
		//
		next(
			null,
			{
				code:500,
				data:'未登录'
			}
		)
		return;
	}

	
	var gameinfo;
	var user_gameinfo;

	var funcs=[];

	funcs.push((cb)=>{
		this.app.rpc.gamechannel.gamechannelRemote.EnterGameChannel(gamechannel_sid,uid,game_id,session.frontendId,(err)=>{
			cb(err);
		})

	});

	funcs.push((cb)=>{
		this.app.rpc.gamedata.gamedataRemote.GetUserGameInfo(gamedata_sid,game_id,uid,(gameinfo_t)=>{
			user_gameinfo=gameinfo_t;
			cb();
		});

	});

	funcs.push((cb)=>{
		this.app.rpc.gamedata.gamedataRemote.GetGameInfo(gamedata_sid,game_id,(gameinfo_t)=>{
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
					data:{
						gameinfo:user_gameinfo,
						groupinfo:gamelib.get_population_genetic_info(gameinfo,uid),
						weight_dic:gamelib.get_all_listable_weight(gameinfo)
					}
				}
			)
			
		}
	});
}

//下一回合
handler.NextTurn=function(msg,session,next)
{
	var uid=session.uid;

	var	game_id=session.get('game_id');
	var gamedata_sid=session.get('gamedata_sid');
	var gamechannel_sid=session.get('gamechannel_sid');
	var timeout_sid=session.get('timeout_sid');

	var direction=msg.direction;
	var current_turn=msg.current_turn;

	if(!game_id)
	{
		//
		next(
			null,
			{
				code:500,
				data:'未登录'
			}
		)
		return;
	}


	var action_list_dic;
	this.app.rpc.gamedata.gamedataRemote.CheckNextTurn(gamedata_sid,game_id,uid,direction,current_turn,(all_ready)=>{
		next(
			null,
			{
				code:200,
				data:true
			}
		)

		// setTimeout()
		// console.log(all_ready);
		

		if(!all_ready)
		{
			this.app.rpc.gamechannel.gamechannelRemote.BroadcastDirectionTurn(gamechannel_sid,game_id,uid,()=>{});
		}
		else
		{
			// this.app.rpc.game.gameRemote.ExecuteDirection(session,game_id,gamedata_sid,gamechannel_sid,timeout_sid,()=>{});
			// console.log('start');
			this.app.rpc.gamedata.gamedataRemote.ExecuteDirection(gamedata_sid,gamedata_sid,game_id,gamechannel_sid,timeout_sid,()=>{
				console.log('callback');
			});

			// this.app.rpc.gamedata.gamedataRemote.ExecuteDirection(gamedata_sid,game_id,(result)=>{
			// 	this.app.rpc.gamechannel.gamechannelRemote.BroadcastActions(gamechannel_sid,game_id,result.action_list_dic,()=>{

			// 	});
			// 	if(!!result.gameover)
			// 	{
			// 		this.app.rpc.gamechannel.gamechannelRemote.GameOver(gamechannel_sid,game_id,result.gameover,()=>{
						
			// 		});
			// 	}
			// })
		}

	});
	// var funcs=[];
	// funcs.push((cb)=>{
	// 	this.app.rpc.gamedata.gamedataRemote.NextTurn(gamedata_sid,game_id,uid,direction,current_turn,(action_list_dic_t)=>{
	// 		action_list_dic=action_list_dic_t;
	// 	});
	// });
	// funcs.push((cb)=>{
	// 	if(action_list_dic==undefined)
	// 	{

	// 	}
	// });
}

//小回合
handler.SubTurn=function(msg,session,next)
{
	var uid=session.uid;

	var	game_id=session.get('game_id');
	var gamedata_sid=session.get('gamedata_sid');
	var gamechannel_sid=session.get('gamechannel_sid');

	var role_id=msg.role_id;
	var direction_did=msg.direction_did;
	var direction_param=msg.direction_param;
	// var current_turn=msg.current_turn;

	if(!game_id)
	{
		//
		next(
			null,
			{
				code:500,
				data:'未登录'
			}
		)
		return;
	}


	var action_dic;
	this.app.rpc.gamedata.gamedataRemote.SubTurn(gamedata_sid,game_id,uid,role_id,direction_did,direction_param,(result)=>{
		next(
			null,
			{
				code:200,
				data:true
			}
		)

		// console.log(result);
		if(!!result)
		{
			this.app.rpc.gamechannel.gamechannelRemote.BroadcastSubActions(gamechannel_sid,game_id,result,()=>{

			});
			// if(!!result.gameover)
			// {
			// 	this.app.rpc.gamechannel.gamechannelRemote.GameOver(gamechannel_sid,game_id,result.gameover,()=>{
					
			// 	});
			// }
		}
			
	});
	// var funcs=[];
	// funcs.push((cb)=>{
	// 	this.app.rpc.gamedata.gamedataRemote.NextTurn(gamedata_sid,game_id,uid,direction,current_turn,(action_list_dic_t)=>{
	// 		action_list_dic=action_list_dic_t;
	// 	});
	// });
	// funcs.push((cb)=>{
	// 	if(action_list_dic==undefined)
	// 	{

	// 	}
	// });
}

//放弃当前进行的游戏
handler.LeaveGame=function(msg,session,next)
{
	var uid=session.uid;

	var	game_id=session.get('game_id');
	var gamedata_sid=session.get('gamedata_sid');
	var gamechannel_sid=session.get('gamechannel_sid');
	var timeout_sid=session.get('timeout_sid');

	if(!game_id)
	{
		//
		next(
			null,
			{
				code:500,
				data:'未登录'
			}
		)
		return;
	}
	else if(game_id==-1)
	{
		//
		next(
			null,
			{
				code:500,
				data:'不在游戏中'
			}
		)
		return;
	}

	this.app.rpc.game.gameRemote.OnUserLeave(session,game_id,gamedata_sid,gamechannel_sid,timeout_sid,uid,(err)=>{
		if(!!err)
		{
			next(
				null,
				{
					code:500,
					data:'退出游戏失败'
				}
			);
		}
		else
		{
			next(
				null,
				{
					code:200,
					data:'退出游戏'
				}
			);
		}
			
	});
		
}