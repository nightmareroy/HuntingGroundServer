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


var defaultDataManager=require('../../../defaultdata/defaultDataManager');


var gamelib=require('../../../gamelib/game');
var maplib=require('../../../gamelib/map');
var skilllib=require('../../../gamelib/skill');
var rolelib=require('../../../gamelib/role');

// const MultiGameStart="MultiGameStart";
const NextTurn="NextTurn";



// var uuid=require("uuid")

// var utils = require('../util/utils');





// handler.updategameinfo = function(msg, session, next) {

// 	var uid=session.uid;
// 	next(
// 				null,
// 				{
// 					code:500,
// 					data:uid
// 				}
// 			)
// 	return


// 	var sql="select * from user where account=?";

// 	dbclient.query(sql,account,(err, res)=>{
// 		if (err)
// 		{
// 			next(
// 				null,
// 				{
// 					code:500,
// 					data:err
// 				}
// 			)
// 		} 

// }

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

//创建多人游戏
// handler.create_multi_game=function(msg,session,next)
// {
// 	// var uid=session.uid;
// 	var gametype_id=msg.gametype_id;
	
// 	var user;

	
// 	var connection;
// 	var sql;
// 	var funcs=[];
// 	funcs.push((cb)=>{
// 		db.getConnection((err,conn)=>{
// 			connection=conn;
// 			cb(err);
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		connection.beginTransaction((err)=>{
// 			cb(err);
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		sql="select * from user where uid=?";
// 		connection.query(sql,session.uid,(err,rows)=>{
// 			if(rows)
// 			{
// 				user=rows[0];
// 			}
// 			cb(err);
// 		});
// 	});
	
// 	funcs.push((cb)=>{
// 		connection.commit((err)=>{
// 			cb(err);
// 		});
// 	});

// 	funcs.push((cb)=>{
// 		this.app.rpc.gamelist.gamelistRemote.onCreateMultiGame(user.uid,user.name,user.name+'的游戏',gametype_id,1,cb);

// 	});


// 	async.waterfall(funcs,(err,result)=>{
// 		if(err)
// 		{
// 			connection.rollback((err_rollback)=>{
// 				connection.release();
// 				next(
// 					null,
// 					{
// 						code:500,
// 						data:false
// 					}
// 				)
// 			});
// 		}
// 		else
// 		{
// 			connection.release();
// 			next(
// 				null,
// 				{
// 					code:200,
// 					data:true
// 				}
// 			)
// 		}
// 	});

	
// }

//离开_创建游戏
// handler.return_gamesetting=function(msg,session,next)
// {
// 	var uid=session.uid;

// 	var channel;

// 	var game;
// 	var game_total_player={};
	


// 	var connection;
// 	var sql;
// 	var funcs=[];
// 	funcs.push((cb)=>{
// 		db.getConnection((err,conn)=>{
// 			connection=conn;
// 			cb(err);
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		connection.beginTransaction((err)=>{
// 			cb(err);
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		sql="select * from game as g,game_total_player as p where g.game_id=p.game_id and p.uid=?";
// 		connection.query(sql,uid,(err,rows)=>{
// 			if(rows)
// 			{
// 				game=rows[0];
				
// 			}
// 			cb(err);
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		sql="select * from game_total_player where game_id=?";
// 		connection.query(sql,game.game_id,(err,rows)=>{
// 			if(rows)
// 			{
// 				for(i in rows)
// 				{
// 					game_total_player[rows[i].uid]=rows[i];
// 				}
// 			}
// 			cb(err);
// 		});
// 	});
	

// 	//如果是创建者，要把本游戏所有信息删掉
// 	funcs.push((cb)=>{
// 		if(game.creator_id==uid)
// 		{
// 			sql="delete from game where creator_id=?";
// 			connection.query(sql,uid,(err,rows)=>{
// 				cb(err);
// 			});
// 		}
// 		else
// 		{
// 			cb();
// 		}
// 	});

// 	funcs.push((cb)=>{
// 		if(game.creator_id==uid)
// 		{
// 			var funcs_delete=[];

// 			for(uid_p in game_total_player)
// 			{
// 				funcs_delete.push((cb_delete)=>{
// 					sql="delete from game_total_player where uid=?";
// 					connection.query(sql,uid_p,(err,rows)=>{
// 						cb_delete(err);
// 					});
// 				});
// 			}

// 			async.waterfall(funcs_delete,(err_delete,result_delete)=>{
// 				cb(err_delete);
// 			});
			
// 		}
// 		else
// 		{
// 			cb();
// 		}
// 	});

// 	funcs.push((cb)=>{
// 		if(game.creator_id==uid)
// 		{
// 			sql="delete from game_total_map where game_id=?";
// 			connection.query(sql,game.game_id,(err,rows)=>{
// 				cb(err);
// 			});
// 		}
// 		else
// 		{
// 			cb();
// 		}
// 	});

// 	funcs.push((cb)=>{
// 		if(game.creator_id==uid)
// 		{
// 			var funcs_delete=[];

// 			for(uid_p in game_total_player)
// 			{
// 				funcs_delete.push((cb_delete)=>{
// 					sql="delete from game_user_map where uid=?";
// 					connection.query(sql,uid_p,(err,rows)=>{
// 						cb_delete(err);
// 					});
// 				});
// 			}
			
// 			async.waterfall(funcs_delete,(err_delete,result_delete)=>{
// 				cb(err_delete);
// 			});
			
// 		}
// 		else
// 		{
// 			cb();
// 		}
// 	});

// 	funcs.push((cb)=>{
// 		if(game.creator_id==uid)
// 		{
// 			var channel = this.channelService.getChannel(game_id, true);
// 			for(uid_p in game_total_player)
// 			{
// 				//所有player的frontendId是一样的
// 				channel.remove(uid_p, session.frontendId);
// 			}
// 			this.app.rpc.gamelist.gamelistRemote.onCancelGame(session,game.game_id,cb);
// 		}
// 		else
// 		{
// 			cb();
// 		}
		
		
// 	});

// 	//如果不是创建者，要把自己的游戏信息删掉
// 	funcs.push((cb)=>{
// 		if(game.creator_id!=uid)
// 		{
// 			sql="delete from game_total_player where uid=?";
// 			connection.query(sql,uid,(err,rows)=>{
// 				cb(err);
// 			});
// 		}
// 		else
// 		{
// 			cb();
// 		}
// 	});

// 	funcs.push((cb)=>{
// 		if(game.creator_id!=uid)
// 		{
// 			sql="delete from game_user_map where uid=?";
// 			connection.query(sql,uid,(err,rows)=>{
// 				cb(err);
// 			});
// 		}
// 		else
// 		{
// 			cb();
// 		}
// 	});

// 	funcs.push((cb)=>{
// 		if(game.creator_id!=uid)
// 		{
// 			var channel = this.channelService.getChannel(game_id, true);
// 			channel.remove(uid, session.frontendId);
// 			this.app.rpc.gamelist.gamelistRemote.onLeaveGame(session,game_id,uid,cb);
// 		}
// 		else
// 		{
// 			cb();
// 		}
		
		
// 	});


// 	funcs.push((cb)=>{
// 		connection.commit((err)=>{
// 			cb(err);
// 		});
// 	});

// 	async.waterfall(funcs,(err,result)=>{
// 		if(err)
// 		{
// 			console.log(err);
// 			connection.rollback((err_rollback)=>{
// 				connection.release();
// 				next(
// 					null,
// 					{
// 						code:500,
// 						data:"can't cancel the game!"
						
// 					}
// 				)
				
// 			});
// 		}
// 		else
// 		{
// 			connection.release();
// 			next(
// 				null,
// 				{
// 					code:200,
// 					data:"cancel game!"
// 				}
// 			)
			
// 		}
// 	});

// }

//加入游戏
// handler.joingame=function(msg,session,callback)
// {
// 	var game_id=msg.game_id;
// 	var uid=session.uid;

// 	var game;
// 	var game_total_player={};
// 	var group_id;

// 	var gametype;
// 	var width;
// 	var height;

// 	var connection;
// 	var sql;
// 	var funcs=[];
// 	funcs.push((cb)=>{
// 		db.getConnection((err,conn)=>{
// 			connection=conn;
// 			cb(err);
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		connection.beginTransaction((err)=>{
// 			cb(err);
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		sql="select * from game where game_id=?";
// 		connection.query(sql,game_id,(err,rows)=>{
// 			if(rows)
// 			{
// 				game=rows[0];
// 				gametype=defaultDataManager.get_d_gametype(game.gametype_id);
// 				width=gametype.width;
// 				height=gametype.height;
// 			}
// 			cb(err);
			
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		sql="select * from game_total_player where game_id=?";
// 		connection.query(sql,[uid,game_id],(err,rows)=>{
// 			if(rows)
// 			{
// 				for(i in rows)
// 				{
// 					game_total_player[rows[i].uid]=rows[i];
// 				}
// 			}
// 			cb(err);
			
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		var isingame=false;
// 		for(uid_t in game_total_player)
// 		{
// 			if(uid_t==uid)
// 			{
// 				isingame=true;
// 				break;
// 			}
// 		}
// 		if(isingame)
// 		{
// 			cb("already in game!");
// 		}
// 		else
// 		{
// 			var temp_p_count=gametype.playercount_in_group.slice(0);
// 			for(uid in game_total_player)
// 			{
// 				temp_p_count[game_total_player[uid].group_id-1]--;
				
// 			}

// 			for(i in temp_p_count)
// 			{
// 				if(temp_p_count[i]>0)
// 				{
// 					group_id=i+1;
// 					cb();
// 				}
// 			}

			
// 			cb("players are enough!");
// 		}
// 	});
// 	funcs.push((cb)=>{
// 		sql="insert into game_total_player values(?,?,?)";
// 		connection.query(sql,[uid,game_id,group_id],(err,rows)=>{
// 			cb(err);
			
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		var detective_map=[];
// 		for(var i=0;i<width*height;i++)
// 		{
// 			detective_map.push(0);
// 		}
// 		sql="insert into game_user_map(uid,detective_map) values (?,?)";
// 		connection.query(sql,[uid,JSON.stringify(detective_map)],(err,rows)=>{
// 			cb(err);
// 		});
// 	});

// 	funcs.push((cb)=>{
// 		connection.commit((err)=>{
// 			cb(err);
// 		});
// 	});

// 	funcs.push((cb)=>{
// 		var channel = this.channelService.getChannel(game_id, false);
// 		channel.add(uid, session.frontendId);
// 		this.app.rpc.gamelist.gamelistRemote.onJoinGame(session,game_id,uid,group_id,cb);

		
		
// 	});


// 	async.waterfall(funcs,(err,result)=>{
// 		if(err)
// 		{
// 			connection.rollback((err_rollback)=>{
// 				connection.release();
// 				next(
// 					null,
// 					{
// 						code:500,
// 						data:false
// 					}
// 				)
// 			});
// 		}
// 		else
// 		{
// 			connection.release();
// 			next(
// 				null,
// 				{
// 					code:200,
// 					data:true
// 				}
// 			)
// 		}
// 	});
// }

//开始游戏
handler.MultiGameStart=function(msg,session,next)
{
	var uid=session.uid;

	var gameinfo_hall;

	var game_total_player={};
	var game_total_role={};
	var game_total_map={};
	var game_user_map={};
	var gametype;

	var game_id;
	var game;


	var data_dic={};

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
	})

	funcs.push((cb)=>{
		gametype=defaultDataManager.get_d_gametype(gameinfo_hall.gametype_id);
		cb();
	});

	funcs.push((cb)=>{
		//插入game
		sql="insert into game (gametype_id,game_name,creator_id) values (?,?,?)";
		console.log(gameinfo_hall);
		connection.query(sql,[gameinfo_hall.gametype_id,gameinfo_hall.game_name,uid],(err,rows)=>{
			if(rows)
			{
				game_id=rows.insertId;
			}

			cb(err);	
		});
	});

	funcs.push((cb)=>{
		//插入total_map
		var landform_map=[];
		var resource_map=[];
		for(var i=0;i<gametype.width*gametype.height;i++)
		{
			var random_l=Math.random();
			var random_r=Math.random();
			if(random_l>0.3)
			{
				//平地
				landform_map.push(1);
			}
			else
			{
				//山地
				landform_map.push(2);
			}

			if(random_r<0.6)
			{
				//无资源
				resource_map.push(1);
			}
			else if(random_r<0.8)
			{
				//森林
				resource_map.push(2);
			}
			else
			{
				//石头
				resource_map.push(3);
			}
			
			
		}

		game_total_map.game_id=game_id;
		game_total_map.landform_map=landform_map;
		game_total_map.resource_map=resource_map;

		sql="insert into game_total_map(game_id,landform_map,resource_map) values (?,?,?)";
		connection.query(sql,[game_id,JSON.stringify(landform_map),JSON.stringify(resource_map)],(err,rows)=>{
			cb(err);
		});

	
		
	});

	funcs.push((cb)=>{
		//插入player
		var sub_funcs=[];
		for(uid_p in gameinfo_hall.players_info)
		{
			(()=>{
				var uid_p_t=uid_p;
				var player={
					uid:gameinfo_hall.players_info[uid_p_t].player_id,
					game_id:game_id,
					group_id:gameinfo_hall.players_info[uid_p_t].group_id,
					direction_turn:0
				}
				game_total_player[uid_p_t]=player;
				sub_funcs.push((cb_sub)=>{
					
					sql="insert into game_total_player (uid,game_id,group_id) values (?,?,?)";
					connection.query(sql,[player.uid,game_id,player.group_id],(err_sub,rows_sub)=>{
						cb_sub(err_sub);
					});
				});

			})();

			
			
		}
		async.waterfall(sub_funcs,(err,result)=>{
			cb(err);
		});
	});

	

	

	funcs.push((cb)=>{
		//插入role
		var sub_funcs=[];
		for(uid_p in gameinfo_hall.players_info)
		{
			var init_role_did_list=JSON.parse(gametype.init_role_did_list);
			var init_role_posid_list=JSON.parse(gametype.init_role_posid_list);
			for(i in init_role_did_list)
			{
				(()=>{
					var role_id=uuid.v1();
					var role_did_t=init_role_did_list[i];
					var pos_id_list=init_role_posid_list[gameinfo_hall.players_info[uid_p].group_id];
					var pos_id=pos_id_list.shift();
					var uid_p_t=parseInt(uid_p);
					sub_funcs.push((cb_sub)=>{
						sql="insert into game_total_role(role_id,role_did,uid,pos_id) values(?,?,?,?)";
						connection.query(sql,[role_id,role_did_t,uid_p_t,pos_id],(err_sub,rows_sub)=>{
							cb_sub(err_sub);
						});
					});
				})();		
			}	
		}
		async.waterfall(sub_funcs,(err,result)=>{
			cb(err);
		});
	});

	funcs.push((cb)=>{
		//读取role
		sql="select r.* from game_total_role r,game_total_player p where r.uid=p.uid and p.game_id=?";
		connection.query(sql,[game_id],(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					game_total_role[rows[i].role_id]=rows[i];
				}
			}
			cb(err);
		});
	});

	funcs.push((cb)=>{
		//插入user_map
		var sub_funcs=[];
		for(uid_p in gameinfo_hall.players_info)
		{
			(()=>{
				var uid_p_t=parseInt(uid_p);
				var detective_map=[];
				for(var i=0;i<gametype.width*gametype.height;i++)
				{
					detective_map.push(0);
				}
				var sightzoon=maplib.getsightzoon_of_player(uid_p_t,game_total_role,game_total_map,gametype);
				console.log(sightzoon)
				for(pos_id in sightzoon)
				{
					detective_map[sightzoon[pos_id]]=1;
				}
				game_user_map[uid_p_t]={
					uid:uid_p_t,
					detective_map:detective_map
				}
				sub_funcs.push((cb_sub)=>{

					
					sql="insert into game_user_map(uid,detective_map) values (?,?)";
					connection.query(sql,[uid_p_t,JSON.stringify(detective_map)],(err_sub,rows_sub)=>{
						cb_sub(err_sub);
					});
				});
			})();
			
			
		}
		async.waterfall(sub_funcs,(err,result)=>{
			cb(err);
		});
		
	});



	


	funcs.push((cb)=>{
		//通知频道内玩家游戏开始
		// this.app.rpc.game.gameRemote.broadcast_start_and_gameinfo();
		for(uid_p in game_total_player)
		{
			var uid_p_t=parseInt(uid_p);
			// data_dic[uid_p_t]={};
			// // data_dic[uid_p_t].game_id=game_id;
			// data_dic[uid_p_t].gametype_id=gametype.gametype_id;
			// data_dic[uid_p_t].current_turn=0;
			// data_dic[uid_p_t].creator_id=uid;
			// data_dic[uid_p_t].map_info={
			// 	landform_map:[],
			// 	resource_map:[],
			// 	width:gametype.width,
			// 	height:gametype.height
			// };
			// data_dic[uid_p_t].allplayers_dic=game_total_player;
			
			// for(pos_id in game_total_map.landform_map)
			// {
			// 	data_dic[uid_p_t].map_info.landform_map[pos_id]=game_total_map.landform_map[pos_id]*game_user_map[uid_p_t].detective_map[pos_id];
			// 	data_dic[uid_p_t].map_info.resource_map[pos_id]=game_total_map.resource_map[pos_id]*game_user_map[uid_p_t].detective_map[pos_id];
			// 	data_dic[uid_p_t].map_info.width=gametype.width;
			// 	data_dic[uid_p_t].map_info.height=gametype.height;
			// }

			// data_dic[uid_p_t].role_dic=maplib.get_roles_in_sightzoon_of_player(uid_p_t,game_total_role,game_total_map,gametype)

			this.app.rpc.gamelist.gamelistRemote.MultiGameStart(session,uid_p_t,()=>{});


			
		}



		cb();
	});

	funcs.push((cb)=>{
		//离开游戏大厅
		// var uid_list=[];
		// for(uid_p in game_total_player)
		// {
		// 	uid_list.push(parseInt(uid_p));
		// }
		this.app.rpc.gamelist.gamelistRemote.onMultiLeaveGameHall(session,session.frontendId,uid,()=>{
			cb();
		});
	});
	

	// funcs.push((cb)=>{
	// 	//创建并加入游戏频道
	// 	var channel = this.channelService.getChannel(game_id, true);
		
	// 	for(uid_p in game_total_player)
	// 	{
	// 		channel.add(parseInt(uid_p), session.frontendId);
	// 	}
	// 	cb();
		
	// });




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
						data:"start game failed.."
						
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
						data:"start game success,please load game info.."
					}
				)
			});
			
			// this.app.rpc.gameRemote.broadcast_start_and_gameinfo(game.game_id,()=>{});
		}
	});


}

//连接游戏频道，并获取游戏数据
handler.LoadGame=function(msg,session,next)
{
	var uid=session.uid;

	var gametype_id;
	var current_turn;
	var creator_id;
	var game_total_player={};
	var game_total_role={};
	var game_total_building={};
	var game_total_map;

	var roles_in_sightzoon={};
	var buildings_in_sightzoon={};

	var map_info={
		landform_map:[],
		resource_map:[],
		width:0,
		height:0
	};
	
	var detective_map=[];


	var game_id;
	var gametype;
	// var mapsizeid;

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
		sql="select * from game_total_player where uid=?";
		connection.query(sql,[uid],(err,rows)=>{
			if(rows)
			{
				if(rows.length==0)
				{
					cb('not in game!')
				}
				game_id=rows[0].game_id;
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from game where game_id=?";
		connection.query(sql,[game_id],(err,rows)=>{
			if(rows)
			{
				var game=rows[0];
				gametype_id=game.gametype_id;
				current_turn=game.current_turn;
				creator_id=game.creator_id;
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		gametype=defaultDataManager.get_d_gametype(gametype_id);
		playercount_in_group=gametype.playercount_in_group;
		npccount_in_group=gametype.npccount_in_group;

		map_info.width=gametype.width;
		map_info.height=gametype.height;
		cb();
	});
	funcs.push((cb)=>{
		sql="select * from game_total_map where game_id=?";
		connection.query(sql,[game_id],(err,rows)=>{
			if(rows)
			{
				game_total_map=rows[0];
				game_total_map.landform_map=JSON.parse(game_total_map.landform_map);
				game_total_map.resource_map=JSON.parse(game_total_map.resource_map);
				
				// mapsizeid=game_total_map.mapsizeid;

			}
			cb(err);
		});
	});
	
	funcs.push((cb)=>{
		sql="select * from game_user_map where uid=?";
		connection.query(sql,[uid],(err,rows)=>{
			if(rows)
			{
				var map=rows[0];
				detective_map=JSON.parse(map.detective_map);

				for(var i=0;i<map_info.width*map_info.height;i++)
				{
					map_info.landform_map[i]=game_total_map.landform_map[i]*detective_map[i];
					map_info.resource_map[i]=game_total_map.resource_map[i]*detective_map[i];
				}
				// console.log(map_info);
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from game_total_player where game_id=?";
		connection.query(sql,[game_id],(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					// game_total_player[rows[i].uid]={};
					// game_total_player[rows[i].uid].uid=rows[i].uid;
					// game_total_player[rows[i].uid].group_id=rows[i].group_id;
					// game_total_player[rows[i].uid].direction_turn=rows[i].direction_turn;
					game_total_player[rows[i].uid]=rows[i];
					if(rows[i].uid!=uid)
					{
						delete game_total_player[rows[i].uid].banana;
					}
				}

			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from game_total_role as r,game_total_player as p where r.uid=p.uid and p.game_id = ?";
		connection.query(sql,[game_id],(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					game_total_role[rows[i].role_id]=rows[i];
					game_total_role[rows[i].role_id].direction_param=JSON.parse(game_total_role[rows[i].role_id].direction_param);
					
				}
				roles_in_sightzoon=maplib.get_roles_in_sightzoon_of_player(uid,game_total_role,game_total_map,gametype);

			}
			cb(err);
		});
	});

	funcs.push((cb)=>{
		sql="select * from game_total_building as b,game_total_player as p where b.uid=p.uid and p.game_id = ?";
		connection.query(sql,[game_id],(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					game_total_building[rows[i].building_id]=rows[i];
					
					
				}
				buildings_in_sightzoon=maplib.get_buildings_in_sightzoon_of_player(uid,game_total_role,game_total_building,game_total_map,gametype);

			}
			cb(err);
		});
	});
	


	funcs.push((cb)=>{
		//加入游戏频道
		// var channel = this.channelService.getChannel(game_id, true);
		// channel.add(uid, session.frontendId);
		// cb();
		// this.app.rpc.gamelist.gamelistRemote.onJoinGame(session,game_id,uid,group_id,cb);

		this.app.rpc.game.gameRemote.EnterGameChannel(session, uid,game_id,session.frontendId,cb);
	});

	// funcs.push((cb)=>{
	// 	//离开游戏大厅
	// 	this.app.rpc.gamelist.gamelistRemote.onLeaveGameHall(session,session.frontendId,uid,cb);

	// });




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
						data:"can't get gameinfo!"
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
						data:{
							// game_id:game_id,
							gametype_id:gametype_id,
							current_turn:current_turn,
							creator_id:creator_id,
							// playercount_in_group:playercount_in_group,
							// npccount_in_group:npccount_in_group,
							map_info:map_info,
							allplayers_dic:game_total_player,
							role_dic:roles_in_sightzoon,
							building_dic:buildings_in_sightzoon
						}
					}
				)
			});
			
			

		}
	});

}

handler.isingame=function(msg,session,next)
{
	var uid=session.uid;

	var isingame=false;


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
		sql="select * from game_total_player where uid=?";
		connection.query(sql,[uid],(err,rows)=>{
			if(rows)
			{
				if(rows.length>0)
				{
					isingame=true;
				}
			}
			cb(err);
		});
	});


	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			connection.rollback((err_rollback)=>{
				connection.release();
				next(
					null,
					{
						code:500,
						data:"error!"
					}
				)
			});
		}
		else
		{
			connection.release();
			next(
				null,
				{
					code:200,
					data:{
						isingame:isingame
					}
				}
			)
		}
	});
}






handler.test=function(msg,session,next)
{
	var uid=session.uid;

	gamelib.getgameinfo(uid,(result)=>{
		next(null,{
			code:200,
			data:result
		})
	})
	
}



handler.NextTurn=function(msg,session,next)
{
	var uid=session.uid;

	var game;
	var game_total_player={};
	var game_total_role={};
	var game_total_building={};
	var game_total_map;
	var game_user_map={};


	var gametype;
	// var width;
	// var height;
	

	var all_ready;
	var action_list_dic;

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


	//读取game
	funcs.push((cb)=>{
		sql="select g.* from game as g,game_total_player as p where p.game_id=g.game_id and p.uid=?";
		connection.query(sql,uid,(err,rows)=>{
			if(rows)
			{
				game=rows[0];
				gametype=defaultDataManager.get_d_gametype(game.gametype_id);
			}
			cb(err);
		});
	});
	//更新player的direction_turn
	funcs.push((cb)=>{
		sql="update game_total_player set direction_turn=? where uid=?";
		connection.query(sql,[msg.current_turn,uid],(err,rows)=>{
			cb(err);
		});
	});

	//更新role的direction
	funcs.push((cb)=>{
		var funcs_direction=[];
		for(role_id in msg.direction)
		{
			var direction_did=msg.direction[role_id].direction_did;
			var direction_param=msg.direction[role_id].direction_param;
			if(!maplib.checkpath(direction_param,gametype.width,gametype.height))
			{
				cb('path error!');
				break;
			}

			
			funcs_direction.push((cb_direction)=>{
				sql="update game_total_role set direction_did=?,direction_param=? where role_id=?";
				connection.query(sql,[direction_did,JSON.stringify(direction_param),role_id],(err_direction,rows_direction)=>{
					cb_direction(err_direction);
				});
			});
		}
		async.waterfall(funcs_direction,(err,result)=>{
			cb(err);
		});
	});
	

	//读取所有相关数据
	funcs.push((cb)=>{
		sql="select * from game_total_player where game_id=?";
		connection.query(sql,game.game_id,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					game_total_player[rows[i].uid]=rows[i];
				}
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select r.* from game_total_role as r,game_total_player as p where p.game_id=? and p.uid=r.uid";
		connection.query(sql,game.game_id,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					game_total_role[rows[i].role_id]=rows[i];
					game_total_role[rows[i].role_id].direction_param=JSON.parse(game_total_role[rows[i].role_id].direction_param);
				}
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from game_total_map where game_id=?";
		connection.query(sql,game.game_id,(err,rows)=>{
			if(rows)
			{
				game_total_map=rows[0];
				game_total_map.landform_map=JSON.parse(game_total_map.landform_map);
				game_total_map.resource_map=JSON.parse(game_total_map.resource_map);
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select m.* from game_user_map as m,game_total_player as p where p.game_id=? and p.uid=m.uid";
		connection.query(sql,game.game_id,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					game_user_map[rows[i].uid]=rows[i];
					game_user_map[rows[i].uid].detective_map=JSON.parse(game_user_map[rows[i].uid].detective_map);
				}
			}
			cb(err);
		});
	});
	

	

	



	//游戏逻辑
	funcs.push((cb)=>{
		// //direction_turn
		// game_total_player[uid].direction_turn=msg.current_turn;
		// //path
		// for(role_id in game_total_role)
		// {
		// 	var role=game_total_role[role_id];
		// 	if(role.uid==uid)
		// 	{
		// 		var direction_did=msg.direction[role_id].direction_did;
		// 		var direction_param=JSON.parse(msg.direction[role_id].direction_param);

		// 		if(!maplib.checkpath(direction_param,gametype.width,gametype.height))
		// 		{
		// 			cb('path error!');
		// 			break;
		// 		}

		// 		role.direction_did=direction_did;
		// 		role.direction_param=direction_param;
		// 	}
		// }

		//check allplayer ready
		all_ready=true;
		for(playerid in game_total_player)
		{
			var player=game_total_player[playerid];
			if(player.direction_turn!=game.current_turn)
			{
				all_ready=false;
				break;
			}
		}
		//execute direction
		
		if(all_ready)
		{
			action_list_dic=gamelib.executedirection(game,game_total_player,game_total_role,game_total_map,game_user_map,gametype);
			console.log(action_list_dic);
		}
		cb();
	});

	//更新所有相关数据
	funcs.push((cb)=>{
		if(all_ready)
		{
			sql="update game set current_turn=? where game_id=?";
			connection.query(sql,[game.current_turn+1,game.game_id],(err,rows)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
		
	});
	
	funcs.push((cb)=>{
		if(all_ready)
		{
			sql="delete r.* from game_total_role as r,game_total_player as p where p.game_id=? and p.uid=r.uid";
			connection.query(sql,game.game_id,(err,rows)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
		
	});
	funcs.push((cb)=>{
		if(all_ready)
		{
			var role_funcs=[];
			for(i in game_total_role)
			{
				(()=>{

					var role_id=game_total_role[i].role_id;
					var role_did=game_total_role[i].role_did;
					var uid2=game_total_role[i].uid;
					var pos_id=game_total_role[i].pos_id;

					var blood_sugar_max=game_total_role[i].blood_sugar_max;
					var blood_sugar=game_total_role[i].blood_sugar;
					var muscle=game_total_role[i].muscle;
					var fat=game_total_role[i].fat;
					var amino_acid=game_total_role[i].amino_acid;
					var breath=game_total_role[i].breath;
					var digest=game_total_role[i].digest;
					var courage=game_total_role[i].courage;
					var far_sight=game_total_role[i].far_sight;
					var see_through=game_total_role[i].see_through;
					var alive=game_total_role[i].alive;

					var direction_did=game_total_role[i].direction_did;
					var direction_param=JSON.stringify(game_total_role[i].direction_param);
					role_funcs.push((cb_role_funcs)=>{
						sql="insert into game_total_role(role_id,role_did,uid,pos_id,blood_sugar_max,blood_sugar,muscle,fat,amino_acid,breath,digest,courage,far_sight,see_through,alive,direction_did,direction_param) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
						connection.query(sql,[role_id,role_did,uid2,pos_id,blood_sugar_max,blood_sugar,muscle,fat,amino_acid,breath,digest,courage,far_sight,see_through,alive,direction_did,direction_param],(err_role_funcs,rows_role_funcs)=>{
							cb_role_funcs(err_role_funcs);
						});
					});
				})();
				
				
			}
			async.waterfall(role_funcs,(err,result)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
	});
	
	funcs.push((cb)=>{
		if(all_ready)
		{
			var resource_map=JSON.stringify(game_total_map.resource_map);
			sql="update game_total_map set resource_map=? where game_id=?";
			connection.query(sql,[resource_map,game.game_id],(err,rows)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
		
	});
	funcs.push((cb)=>{
		if(all_ready)
		{
			var user_map_funcs=[];
			for(uid in game_user_map)
			{
				(()=>{
					var uid_t=uid
					var detective_map=JSON.stringify(game_user_map[uid_t].detective_map);
					user_map_funcs.push((cb_user_map_funcs)=>{
						
						sql="update game_user_map set detective_map=? where uid=?";
						connection.query(sql,[detective_map,uid_t],(err,rows)=>{
							cb_user_map_funcs(err);
						});
					});
				})();
				
				
			}
			async.waterfall(user_map_funcs,(err,result)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
		
	});

	funcs.push((cb)=>{
		//广播行动列表
		if(all_ready)
		{
			this.app.rpc.game.gameRemote.BroadcastActions(session,game.game_id,action_list_dic,()=>{
				cb();
			});
		}
		else
		{
			cb();
		}
		
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



handler.fail=function(msg,session,next)
{
	var uid=session.uid;

	var game;
	var player;
	var gametype;
	var game_total_player={};

	var winner_id;

	// var winner_id_list=[];

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
		sql="select * from game_total_player where uid=?";
		connection.query(sql,uid,(err,rows)=>{
			if(rows)
			{
				if(rows.length==0)
				{
					cb('not in game!')
				}
				else
				{
					player=rows[0];
					cb();
				}
				
			}
			else
			{
				cb(err);
			}
			
		});
	});
	funcs.push((cb)=>{
		sql="select * from game where game_id=?";
		connection.query(sql,player.game_id,(err,rows)=>{
			if(rows)
			{
				game=rows[0];
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from game_total_player where game_id=?";
		connection.query(sql,player.game_id,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					game_total_player[rows[i].uid]=rows[i];
				}
				
			}
			cb(err);
		});
	});




	



	funcs.push((cb)=>{
		sql="delete from game_total_role where uid=?";
		connection.query(sql,uid,(err,rows)=>{
			cb(err);
		});
	});

	funcs.push((cb)=>{
		sql="delete from game_total_building where uid=?";
		connection.query(sql,uid,(err,rows)=>{
			cb(err);
		});
	});

	funcs.push((cb)=>{
		sql="delete from game_total_player where uid=?";
		connection.query(sql,uid,(err,rows)=>{
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="delete from game_user_map where uid=?";
		connection.query(sql,uid,(err,rows)=>{
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="update user set failure_count=failure_count+1 where uid=?";
		connection.query(sql,uid,(err,rows)=>{
			cb(err);
		});
	});



	//判定剩余的一人胜利，并删除数据
	funcs.push((cb)=>{
		if(game_total_player.length==1)
		{
			for(uid_t in game_total_player)
			{
				winner_id=game_total_player[uid_t].uid;
			}

			sql="delete from game_total_role where uid=?";
			connection.query(sql,winner_id,(err,rows)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
	});

	funcs.push((cb)=>{
		if(game_total_player.length==1)
		{
			sql="delete from game_total_building where uid=?";
			connection.query(sql,winner_id,(err,rows)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
	});

	funcs.push((cb)=>{
		if(game_total_player.length==1)
		{
			sql="delete from game_total_player where uid=?";
			connection.query(sql,winner_id,(err,rows)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
	});

	funcs.push((cb)=>{
		if(game_total_player.length==1)
		{
			sql="delete from game_user_map where uid=?";
			connection.query(sql,winner_id,(err,rows)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
	});

	funcs.push((cb)=>{
		if(game_total_player.length==1)
		{
			sql="update user set win_count=win_count+1 where uid=?";
			connection.query(sql,winner_id,(err,rows)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
	});


	//删除游戏公共数据
	funcs.push((cb)=>{
		// gametype=defaultDataManager.get_d_gametype(game.gametype_id);
		if(game_total_player.length==1)
		{
			sql="delete from game where game_id=?";
			connection.query(sql,game_id,(err,rows)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
	});
	funcs.push((cb)=>{
		if(game_total_player.length==1)
		{
			sql="delete from game_total_map where game_id=?";
			connection.query(sql,game_id,(err,rows)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
	});

	funcs.push((cb)=>{
		this.app.rpc.game.gameRemote.LeaveGameChannel(session,uid,()=>{
			cb();
		});
	});

	funcs.push((cb)=>{
		this.app.rpc.game.gameRemote.BroadcastPlayerFail(session,uid,()=>{
			cb();
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