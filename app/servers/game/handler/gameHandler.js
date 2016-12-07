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
	funcs.push((cb)=>{
		connection.commit((err)=>{
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
						data:err
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
					data:result
				}
			)
		}
	});
}


handler.createnewgame=function(msg,session,next)
{
	var uid=session.uid;
	var gametype=msg.gametype;
	var mapsizeid=msg.mapsizeid;

	
	var mapsize=defaultDataManager.get_d_mapsize(mapsizeid);
	var height=mapsize.height;
	var width=mapsize.width;

	var connection;
	var sql;
	var gameid;
	
	var funcs=[(cb)=>{
		db.getConnection((err,conn)=>{
			connection=conn;
			cb(err);
		});
	},(cb)=>{
		connection.beginTransaction((err)=>{
			cb(err);
		});
	},(cb)=>{
		//检测player
		sql="select * from game_total_player where uid=?";
		connection.query(sql,uid,(err,rows)=>{
			if(rows)
			{
				if(rows.length>0)
				{
					cb("already in game");
				}
				else
				{
					cb(err);
				}
				
			}
			else
			{
				cb(err);
			}
		});
	},(cb)=>{
		//插入game
		sql="insert into game (gametype,creatorid) values (?,?)";
		connection.query(sql,[gametype,uid],(err,rows)=>{
			if(rows)
			{
				gameid=rows.insertId;
			}
			cb(err);	
		});
	},(cb)=>{
		//插入player
		sql="insert into game_total_player (uid,gameid,groupid) values (?,?,?)";
		connection.query(sql,[uid,gameid,1],(err,rows)=>{
			cb(err);
		});
	},(cb)=>{
		//插入total_map
		var landform_map=[];
		var resource_map=[];
		for(var i=0;i<width*height;i++)
		{
			landform_map.push(1);
			resource_map.push(1);
		}
		sql="insert into game_total_map(gameid,landform_map,resource_map,mapsizeid) values (?,?,?,?)";
		connection.query(sql,[gameid,JSON.stringify(landform_map),JSON.stringify(resource_map),mapsizeid],(err,rows)=>{
			cb(err);
		});
	},(cb)=>{
		//插入user_map
		var detective_map=[];
		for(var i=0;i<width*height;i++)
		{
			detective_map.push(0);
		}
		sql="insert into game_user_map(uid,detective_map) values (?,?)";
		connection.query(sql,[uid,JSON.stringify(detective_map)],(err,rows)=>{
			cb(err);
		});
	},(cb)=>{
		//在游戏列表大厅中注册本游戏
		this.app.rpc.gamelist.gamelistRemote.registerGame({
			gameid:gameid,
			gametype:gametype,
			playercount:1
		},cb);
	},(cb)=>{
		connection.commit((err)=>{
			cb(err);
		});
	}];



	
	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			connection.rollback((err_rollback)=>{
				connection.release();
				next(
					null,
					{
						code:500,
						data:"can't create new game!"
						
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
					data:"create new game!"
				}
			)
			
		}
	});

}

//开始游戏
handler.startgame=function(msg,session,callback)
{
	var uid=session.uid;


	var game;
	var playerlist=[];

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
		//获取并检测game
		sql="select * from game where creatorid=?";
		connection.query(sql,uid,(err,rows)=>{
			if(rows)
			{
				if(rows.length>0)
				{
					game=rows[0];
					if(game.current_turn!='0')
					{
						cb("the game was already started!");
					}
					else
					{
						cb(err);
					}
				}
				else
				{
					cb("haven't created game");
				}
			}
			else
			{
				cb(err);
			}
		});
	});
	funcs.push((cb)=>{
		//更改current_turn
		sql="update game set current_turn = ? where gameid = ?";
		connection.query(sql,[1,game.gameid],(err,rows)=>{
			cb(err);
		});
	});

	funcs.push((cb)=>{
		//查找游戏所有player
		sql="select * from game_total_player where gameid = ?";
		connection.query(sql,[game.gameid],(err,rows)=>{
			if(rows)
			{
				for(var i=0;i<rows.length;i++)
				{
					playerlist.push(rows[i].uid);
				}
			}
			cb(err);
		});
	});

	funcs.push((cb)=>{

		//初始化role
		switch(game.gametype)
		{
			case 1:
				//每个player添加role
				var insert_sqls=[];
				for(var i=0;i<playerlist.length;i++)
				{
					insert_sqls.push({
						sql:"insert into game_total_role(roledid,uid,pos_id) values(?,?,?)",
						param:[1,playerlist[i],5]
					});
					
				}
				async.eachSeries(insert_sqls,(item,insert_cb)=>{
					connection.query(item.sql,item.param,(err,rows)=>{
						insert_cb(err);
					});
				},(err)=>{

					cb(err);
				});

				break;
			default:
				break;
		}	
	});

	

	
	funcs.push((cb)=>{
		connection.commit((err)=>{
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
						data:"start game failed,please rollback!"
						
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
					data:"start game!"
				}
			)
		}
	});


}

//连接游戏频道，并获取游戏数据
handler.loadgame=function(msg,session,next)
{
	var uid=session.uid;

	var gametype;
	var current_turn;
	var creatorid;
	// var playercount_in_group=[];
	// var npccount_in_group=[];
	var game_total_player={};
	var game_total_role={};
	var game_total_map;
	var roles_in_sightzoon={};

	var mapinfo={
		landform_map:[],
		resource_map:[],
		width:0,
		height:0
	};
	// var allplayers_dic={};


	// var total_landform_map=[];
	// var total_resource_map=[];
	var detective_map=[];


	var gameid;
	var mapsizeid;

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
				gameid=rows[0].gameid;
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from game where gameid=?";
		connection.query(sql,[gameid],(err,rows)=>{
			if(rows)
			{
				var game=rows[0];
				gametype=game.gametype;
				current_turn=game.current_turn;
				creatorid=game.creatorid;
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		var gametypedetail=defaultDataManager.get_d_gametype(gametype);
		playercount_in_group=gametypedetail.playercount_in_group;
		npccount_in_group=gametypedetail.npccount_in_group;
		cb();
	});
	funcs.push((cb)=>{
		sql="select * from game_total_map where gameid=?";
		connection.query(sql,[gameid],(err,rows)=>{
			if(rows)
			{
				game_total_map=rows[0];
				game_total_map.landform_map=JSON.parse(game_total_map.landform_map);
				game_total_map.resource_map=JSON.parse(game_total_map.resource_map);
				// mapinfo.landform_map=JSON.parse(map.landform_map);
				// mapinfo.resource_map=JSON.parse(map.resource_map);
				// total_landform_map=JSON.parse(map.landform_map);
				// total_resource_map=JSON.parse(map.resource_map);
				mapsizeid=game_total_map.mapsizeid;

			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		var mapsize=defaultDataManager.get_d_mapsize(mapsizeid);
		mapinfo.width=mapsize.width;
		mapinfo.height=mapsize.height;
		cb();
	});
	funcs.push((cb)=>{
		sql="select * from game_user_map where uid=?";
		connection.query(sql,[uid],(err,rows)=>{
			if(rows)
			{
				var map=rows[0];
				detective_map=JSON.parse(map.detective_map);

				for(var i=0;i<mapinfo.width*mapinfo.height;i++)
				{
					mapinfo.landform_map[i]=game_total_map.landform_map[i]*detective_map[i];
					mapinfo.resource_map[i]=game_total_map.resource_map[i]*detective_map[i];
				}
				// console.log(mapinfo);
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from game_total_player where gameid=?";
		connection.query(sql,[gameid],(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					game_total_player[rows[i].uid]={};
					game_total_player[rows[i].uid].uid=rows[i].uid;
					game_total_player[rows[i].uid].groupid=rows[i].groupid;
					game_total_player[rows[i].uid].direction_turn=rows[i].direction_turn;
				}

			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from game_total_role as r,game_total_player as p where r.uid=p.uid and p.gameid = ?";
		connection.query(sql,[gameid],(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					game_total_role[rows[i].roleid]=rows[i];
					
					// var roleinfo={};
					// roleinfo.id=rows[i].roleid;
					// roleinfo.did=rows[i].roledid;
					// roleinfo.playerid=rows[i].uid;
					// roleinfo.pos_id=rows[i].pos_id;
					// roleinfo.health=rows[i].health;
					// roleinfo.retreating=rows[i].retreating;
					// roleinfo.fighting_last_turn=rows[i].fighting_last_turn;
					// roleinfo.add_skill_list=[];

					// allplayers_dic[rows[i].uid].role_dic[roleinfo.id]=roleinfo;
				}
				roles_in_sightzoon=maplib.get_roles_in_sightzoon_of_player(uid,game_total_role,game_total_map,mapinfo.width,mapinfo.height)

			}
			cb(err);
		});
	});
	// funcs.push((cb)=>{
	// 	sql="select * from game_total_role as r,game_total_player as p,game_total_roleaddskill as s where r.uid=p.uid and r.roleid=s.roleid and p.gameid = ?";
	// 	connection.query(sql,[gameid],(err,rows)=>{
	// 		if(rows)
	// 		{
	// 			for(i in rows)
	// 			{
	// 				var skillid=rows[i].skillid;
					

	// 				allplayers_dic[rows[i].uid].role_dic[rows[i].roleid].add_skill_list.push(skillid);
	// 			}

	// 		}
	// 		cb(err);
	// 	});
	// });
	// funcs.push((cb)=>{
	// 	sql="select * from game_total_player where gameid = ?";
	// 	connection.query(sql,[gameid],(err,rows)=>{
	// 		if(rows)
	// 		{
	// 			for(i in rows)
	// 			{
	// 				var direction_turn=rows[i].direction_turn;
	// 				// logger.info(direction.current_turn==current_turn?true:false);
	// 				allplayers_dic[rows[i].uid].ready=direction_turn==current_turn?true:false;
	// 			}

	// 		}
	// 		cb(err);
	// 	});
	// });
	funcs.push((cb)=>{
		connection.commit((err)=>{
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
						data:"can't get gameinfo!"
					}
				)
			});
		}
		else
		{
			connection.release();
			this.app.rpc.connector.entryRemote.joingame(session, uid,gameid,()=>{});
			next(
				null,
				{
					code:200,
					data:{
						gameid:gameid,
						gametype:gametype,
						current_turn:current_turn,
						creatorid:creatorid,
						// playercount_in_group:playercount_in_group,
						// npccount_in_group:npccount_in_group,
						mapinfo:mapinfo,
						allplayers_dic:game_total_player,
						role_dic:roles_in_sightzoon
					}
				}
			)

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



handler.nextturn=function(msg,session,next)
{
	var uid=session.uid;

	var game;
	var game_total_player={};
	var game_total_role={};
	var game_total_map;
	var game_user_map={};


	var width;
	var height;
	

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
		sql="select * from game as g,game_total_player as p where p.gameid=g.gameid and p.uid=?";
		connection.query(sql,uid,(err,rows)=>{
			if(rows)
			{
				game=rows[0];
			}
			cb(err);
		});
	});
	// //更新player的direction_turn
	// funcs.push((cb)=>{
	// 	sql="update game_total_player set direction_turn=? where gameid=?";
	// 	connection.query(sql,[msg.current_turn,game.gameid],(err,rows)=>{
	// 		cb(err);
	// 	});
	// });

	// //更新role的direction
	// for(roleid in msg.direction)
	// {
	// 	var direction_id=msg.direction[roleid].directionid;
	// 	var direction_path=msg.direction[roleid].directionpath;
	// 	if(!maplib.checkpath(direction_path,width,height))
	// 	{
	// 		cb('path error!');
	// 		break;
	// 	}
	// 	funcs.push((cb)=>{

	// 		sql="update game_total_role set direction_id=?,direction_path=? where roleid=?";
	// 		connection.query(sql,[direction_id,JSON.stringify(direction_path),roleid],(err,rows)=>{
	// 			cb(err);
	// 		});
	// 	});
	// }
	//读取其他所有相关数据
	funcs.push((cb)=>{
		sql="select * from game_total_player where gameid=?";
		connection.query(sql,game.gameid,(err,rows)=>{
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
		sql="select * from game_total_role as r,game_total_player as p where p.gameid=? and p.uid=r.uid";
		connection.query(sql,game.gameid,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					game_total_role[rows[i].roleid]=rows[i];
					game_total_role[rows[i].roleid].direction_path=JSON.parse(game_total_role[rows[i].roleid].direction_path);
				}
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from game_total_map where gameid=?";
		connection.query(sql,game.gameid,(err,rows)=>{
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
		sql="select * from game_user_map as m,game_total_player as p where p.gameid=? and p.uid=m.uid";
		connection.query(sql,game.gameid,(err,rows)=>{
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
	funcs.push((cb)=>{
		var mapsize=defaultDataManager.get_d_mapsize(game_total_map.mapsizeid);
		height=mapsize.height;
		width=mapsize.width;
		cb();
	});

	

	



	//游戏逻辑
	funcs.push((cb)=>{
		//direction_turn
		game_total_player[uid].direction_turn=msg.current_turn;
		//path
		for(roleid in game_total_role)
		{
			var role=game_total_role[roleid];
			if(role.uid==uid)
			{
				var direction_id=msg.direction[roleid].directionid;
				var direction_path=JSON.parse(msg.direction[roleid].directionpath);

				if(!maplib.checkpath(direction_path,width,height))
				{
					cb('path error!');
					break;
				}

				role.direction_id=direction_id;
				role.direction_path=direction_path;
			}
		}

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
			action_list_dic=gamelib.executedirection(game,game_total_player,game_total_role,game_total_map,game_user_map,width,height);
			console.log(action_list_dic);
		}
		cb();
	});

	//更新所有相关数据
	funcs.push((cb)=>{
		if(all_ready)
		{
			sql="update game set current_turn=? where gameid=?";
			connection.query(sql,[game.current_turn+1,game.gameid],(err,rows)=>{
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
			for(i in game_total_player)
			{
				var direction_turn=game_total_player[i].direction_turn;
				role_funcs.push((cb_role_funcs)=>{
					// console.log([roleid,roledid,uid2,pos_id,health,retreating,fighting_last_turn,direction_id,direction_path]);
					sql="update game_total_player set direction_turn=?";
					connection.query(sql,direction_turn,(err,rows)=>{
						cb_role_funcs(err);
					});
				});
				
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
			sql="delete r from game_total_role as r,game_total_player as p where p.gameid=? and p.uid=r.uid";
			connection.query(sql,game.gameid,(err,rows)=>{
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
				var roleid=game_total_role[i].roleid;
				var roledid=game_total_role[i].roledid;
				var uid2=game_total_role[i].uid;
				var pos_id=game_total_role[i].pos_id;
				var health=game_total_role[i].health;
				var retreating=game_total_role[i].retreating;
				var fighting_last_turn=game_total_role[i].fighting_last_turn;
				var direction_id=game_total_role[i].direction_id;
				var direction_path=JSON.stringify(game_total_role[i].direction_path);
				role_funcs.push((cb_role_funcs)=>{
					sql="insert into game_total_role values(?,?,?,?,?,?,?,?,?)";
					connection.query(sql,[roleid,roledid,uid2,pos_id,health,retreating,fighting_last_turn,direction_id,direction_path],(err,rows)=>{
						cb_role_funcs(err);
					});
				});
				
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
			sql="update game_total_map set resource_map=? where gameid=?";
			connection.query(sql,[resource_map,game.gameid],(err,rows)=>{
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
				
				user_map_funcs.push((cb_user_map_funcs)=>{
					var detective_map=JSON.stringify(game_user_map[uid].detective_map);
					sql="update game_user_map set detective_map=? where uid=?";
					connection.query(sql,[detective_map,uid],(err,rows)=>{
						cb_user_map_funcs(err);
					});
				});
				
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
		connection.commit((err)=>{
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
			connection.release();
			next(
				null,
				{
					code:200,
					data:true
				}
			)
			//广播行动列表
			if(all_ready)
			{
				for(uid in action_list_dic)
				{
					this.app.rpc.connector.entryRemote.broadcast_action(session,game.gameid,"doAction",action_list_dic[uid],()=>{
						// logger.info('msg have broadcasted!')
					});
				}
			}
		}
	});

}



handler.executedirection=function()
{

}