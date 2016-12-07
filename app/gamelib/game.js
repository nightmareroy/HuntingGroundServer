var pomelo = require('pomelo');
var async=require('async');
var db=pomelo.app.get('db');

var logger = require('pomelo-logger').getLogger(__filename);
var defaultDataManager=require('../defaultdata/defaultDataManager');

var actionlib=require("./action");
var maplib=require("./map");
var rolelib=require("./role");
var skilllib=require("./skill");



exports.isingame=function(uid,callback)
{
	
}


exports.updatedirection=function(uid,direction,current_turn_new,callback)
{
	var current_turn;
	var recorded_direction=null;
	var have_updated;
	var gameid;
	var width;
	var height;
	

	var all_ready;

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
		sql="select * from game as g,game_total_player as p where p.gameid=g.gameid and p.uid=?";
		connection.query(sql,uid,(err,rows)=>{
			if(rows)
			{
				current_turn=rows[0].current_turn;
				gameid=rows[0].gameid;

				if(current_turn!=current_turn_new)
				{
					cb('current turn error!')
				}
				else
				{
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
		sql="update game_total_player set direction_turn=? where uid=?";
		connection.query(sql,[current_turn_new,uid],(err,rows)=>{
			cb(err);
		});
	});


	funcs.push((cb)=>{
		sql="select * from game_total_map as m,mapsize as s where m.gameid=? and m.mapsizeid=s.mapsizeid";
		connection.query(sql,gameid,(err,rows)=>{
			if(rows)
			{
				width=rows[0].width;
				height=rows[0].height;
			}
			cb(err);
		});
	});


	for(roleid in direction)
	{

		funcs.push((cb)=>{
			var direction_id=direction[roleid].directionid;
			var direction_path=direction[roleid].directionpath;
			if(!maplib.checkpath(direction_path,width,height))
			{
				cb('path error!')
			}
			else
			{
				sql="update game_total_role set direction_id=?,direction_path=?";
				connection.query(sql,[direction_id,direction_path],(err,rows)=>{
					cb(err);
				});
			}

			
		});
	}

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
				callback(false);
			});
		}
		else
		{
			connection.release();
			callback(
				{
					result:true,
					gameid:gameid,
					current_turn:current_turn
				}
			);
		}
	});
}

exports.checkallplayerready=function(gameid,current_turn_game,callback)
{
	// var current_turn_game;
	var all_ready;
	var playeridlist=[];

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
	// funcs.push((cb)=>{
	// 	sql="select * from game where gameid=?";
	// 	connection.query(sql,gameid,(err,rows)=>{
	// 		if(rows)
	// 		{
	// 			current_turn_game=rows[0].current_turn;
	// 		}
	// 		cb(err);
	// 	});
	// });
	funcs.push((cb)=>{
		sql="select * from game_total_player where gameid=?";
		connection.query(sql,gameid,(err,rows)=>{
			if(rows)
			{
				all_ready=true;
				for(i in rows)
				{
					if(rows[i].direction_turn!=current_turn_game)
					{
						all_ready=false;
						break;
					}
				}
			}
			cb(err);
		});
	});
	// funcs.push((cb)=>{
	// 	sql="select * from game_total_player where gameid=?";
	// 	connection.query(sql,gameid,(err,rows)=>{
	// 		if(rows)
	// 		{
	// 			for(i in rows)
	// 			{
	// 				playeridlist.push(rows[i].uid);
	// 			}
	// 		}
	// 		cb(err);
	// 	});
	// });
	// funcs.push((cb)=>{
	// 	sql="select * from game_user_direction as d,game_total_player as p where d.uid=p.uid and p.gameid=?";
	// 	connection.query(sql,gameid,(err,rows)=>{
	// 		if(rows)
	// 		{
	// 			all_ready=true;
	// 			for(i in playeridlist)
	// 			{
	// 				var isready=false;
	// 				for(j in rows)
	// 				{
	// 					// logger.info('%d == %d',playeridlist[i],rows[j].uid);
	// 					if(playeridlist[i]==rows[j].uid)
	// 					{
	// 						if(rows[j].current_turn==current_turn_game)
	// 						{
	// 							isready=true;
	// 							break;
	// 						}
	// 					}
	// 				}
	// 				if(isready==false)
	// 				{
	// 					all_ready=false;
	// 					break;
	// 				}
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
				callback(false);
			});
		}
		else
		{
			connection.release();
			callback(all_ready);
		}
	});
}


//action type:
//0:移动
//1:受到伤害
//2:获得状态：(0.撤退)
exports.executedirection=function(game,game_total_player,game_total_role,game_total_map,game_user_map,width,height)
{
	// console.log(game);
	// console.log(game_total_player);
	// console.log(game_total_role);
	// console.log(game_total_map);
	// console.log(game_user_map);
	// console.log(width);
	// console.log(height);
	var action_list_dic={};
	for(uid in game_total_player)
	{
		action_list_dic[uid]=[];
	}
	var step=-1;


	var normal_roles;
	var retreating_roles;
	var role;
	var next_pos;
	while(step<6)
	{
		step++;
		// action_list[step]={};
		for(uid in game_total_player)
		{
			action_list_dic[uid][step]={};
		}
		// console.log('action_list:');
		// console.log(action_list);
		if(step==0)
		{
			//执行回合间隙的操作

			
			for(uid in game_total_player)
			{
				//role变化字典
				var insight_roles=maplib.get_roleids_in_sightzoon_of_player(uid,game_total_role,game_total_map,width,height);
				action_list_dic[uid][step].insight_roles=insight_roles;

				//地图变化字典
				action_list_dic[uid][step].landform_map={};
				action_list_dic[uid][step].resource_map={};
				var sightzoon=maplib.getsightzoon_of_player(uid,game_total_role,game_total_map,width,height);
				for(id in sightzoon)
				{
					var zoon_id=sightzoon[id];
					action_list_dic[uid][step].landform_map[zoon_id]=game_total_map.landform_map[zoon_id]*game_user_map[uid].detective_map[zoon_id];
					action_list_dic[uid][step].resource_map[zoon_id]=game_total_map.resource_map[zoon_id]*game_user_map[uid].detective_map[zoon_id];
				}
			}

			

			continue;
		}
		else if(step==1||step==2||step==3||step==4)
		{
			//创建位置变化字典
			for(uid in game_total_player)
			{
				action_list_dic[uid][step].pos={};
			}

			//速度等级为3的role在1234回合里都可以移动
			//只有执行攻击指令(direction_id==2)的role才会在这几个回合里行动
			normal_roles=[];
			retreating_roles=[];
			for(roleid in game_total_role)
			{
				role=game_total_role[roleid];
				if(role.direction_id==2&&role.direction_path.length>0)
				{
					next_pos=role.direction_path[0];
					//速度等级为3的role加入列表
					if(rolelib.get_role_speed_lv(role,game_total_map.landform_map,next_pos)==3)
					{
						if(role.retreating==0)
						{
							normal_roles.push(role);
						}
						else if(role.retreating==1)
						{
							retreating_roles.push(role);
						}
						
					}


				}
				
			}
			//不在撤退状态的role先移动
			while(normal_roles.length>0)
			{
				//乱序排列
				normal_roles.sort(get_random);
				role=normal_roles.shift();
				//不在战斗中
				if(rolelib.get_role_fight_state(role.roleid,game_total_role,game_total_player,width,height)==false)
				{
					next_pos=role.direction_path[0];
					if(maplib.get_pos_movable(game_total_role,next_pos))
					{
						//执行移动
						next_pos=role.direction_path.shift();
						maplib.do_role_move(role.roleid,next_pos,game_total_role,game_total_map,game_user_map,width,height);
						for(uid in game_total_player)
						{
							action_list_dic[uid][step].pos={};
							if(action_list_dic[uid][step-1].insight_roles.indexOf(role.roleid)!=-1||action_list_dic[uid][step].landform_map[next_pos]!=undefined)
							{
								action_list_dic[uid][step].pos[role.roleid]=next_pos;
							}		
						}
					}
					
				}

			}
			//在撤退状态的role后移动
			while(retreating_roles.length>0)
			{
				//乱序排列
				retreating_roles.sort(get_random);
				role=retreating_roles.shift();
				//不在战斗中
				if(rolelib.get_role_fight_state(role.roleid,game_total_role,game_total_player,width,height)==false)
				{
					next_pos=role.direction_path[0];
					if(maplib.get_pos_movable(game_total_role,next_pos))
					{
						//执行移动
						next_pos=role.direction_path.shift();
						maplib.do_role_move(role.roleid,next_pos,game_total_role,game_total_map,game_user_map,width,height);
						for(uid in game_total_player)
						{
							action_list_dic[uid][step].pos={};
							if(action_list_dic[uid][step-1].insight_roles.indexOf(role.roleid)!=-1||action_list_dic[uid][step].landform_map[next_pos]!=undefined)
							{
								action_list_dic[uid][step].pos[role.roleid]=next_pos;
							}		
						}
					}
				}

			}


			//速度等级为2的role只在24回合里可以移动
			if(step==2||step==4)
			{
				//只有执行攻击指令(direction_id==2)的role才会在这几个回合里行动
				normal_roles=[];
				retreating_roles=[];
				for(roleid in game_total_role)
				{
					role=game_total_role[roleid];
					if(role.direction_id==2&&role.direction_path.length>0)
					{
						next_pos=role.direction_path[0];
						//速度等级为2的role加入列表
						if(rolelib.get_role_speed_lv(role,game_total_map.landform_map,next_pos)==2)
						{
							if(role.retreating==0)
							{
								normal_roles.push(role);
							}
							else if(role.retreating==1)
							{
								retreating_roles.push(role);
							}
							
						}


					}
					
				}
				
				//不在撤退状态的role先移动
				while(normal_roles.length>0)
				{
					//乱序排列
					normal_roles.sort(get_random);
					role=normal_roles.shift();
					//不在战斗中
					if(rolelib.get_role_fight_state(role.roleid,game_total_role,game_total_player,width,height)==false)
					{
						next_pos=role.direction_path[0];
						// console.log(maplib.get_pos_movable(game_total_role,next_pos))
						if(maplib.get_pos_movable(game_total_role,next_pos))
						{
							//执行移动
							
							next_pos=role.direction_path.shift();
							maplib.do_role_move(role.roleid,next_pos,game_total_role,game_total_map,game_user_map,width,height);
							for(uid in game_total_player)
							{
								action_list_dic[uid][step].pos={};
								if(action_list_dic[uid][step-1].insight_roles.indexOf(role.roleid)!=-1||action_list_dic[uid][step].landform_map[next_pos]!=undefined)
								{
									action_list_dic[uid][step].pos[role.roleid]=next_pos;
								}		
							}
						}
					}

				}
				//在撤退状态的role后移动
				while(retreating_roles.length>0)
				{
					//乱序排列
					retreating_roles.sort(get_random);
					role=retreating_roles.shift();
					//不在战斗中
					if(rolelib.get_role_fight_state(role.roleid,game_total_role,game_total_player,width,height)==false)
					{
						next_pos=role.direction_path[0];
						if(maplib.get_pos_movable(game_total_role,next_pos))
						{
							//执行移动
							next_pos=role.direction_path.shift();
							maplib.do_role_move(role.roleid,next_pos,game_total_role,game_total_map,game_user_map,width,height);
							for(uid in game_total_player)
							{
								action_list_dic[uid][step].pos={};
								if(action_list_dic[uid][step-1].insight_roles.indexOf(role.roleid)!=-1||action_list_dic[uid][step].landform_map[next_pos]!=undefined)
								{
									action_list_dic[uid][step].pos[role.roleid]=next_pos;
								}		
							}
						}
					}

				}
			}

			//速度等级为1的role只在4回合里可以移动
			if(step==4)
			{
				//只有执行攻击指令(direction_id==2)的role才会在这几个回合里行动
				normal_roles=[];
				retreating_roles=[];
				for(roleid in game_total_role)
				{
					role=game_total_role[roleid];
					if(role.direction_id==2&&role.direction_path.length>0)
					{
						next_pos=role.direction_path[0];
						//速度等级为2的role加入列表
						if(rolelib.get_role_speed_lv(role,game_total_map.landform_map,next_pos)==1)
						{
							if(role.retreating==0)
							{
								normal_roles.push(role);
							}
							else if(role.retreating==1)
							{
								retreating_roles.push(role);
							}
							
						}


					}
					
				}
				//不在撤退状态的role先移动
				while(normal_roles.length>0)
				{
					//乱序排列
					normal_roles.sort(get_random);
					role=normal_roles.shift();
					//不在战斗中
					if(rolelib.get_role_fight_state(role.roleid,game_total_role,game_total_player,width,height)==false)
					{
						next_pos=role.direction_path[0];
						if(maplib.get_pos_movable(game_total_role,next_pos))
						{
							//执行移动
							next_pos=role.direction_path.shift();
							maplib.do_role_move(role.roleid,next_pos,game_total_role,game_total_map,game_user_map,width,height);
							for(uid in game_total_player)
							{
								action_list_dic[uid][step].pos={};
								if(action_list_dic[uid][step-1].insight_roles.indexOf(role.roleid)!=-1||action_list_dic[uid][step].landform_map[next_pos]!=undefined)
								{
									action_list_dic[uid][step].pos[role.roleid]=next_pos;
								}		
							}
						}
					}

				}
				//在撤退状态的role后移动
				while(retreating_roles.length>0)
				{
					//乱序排列
					retreating_roles.sort(get_random);
					role=retreating_roles.shift();
					//不在战斗中
					if(rolelib.get_role_fight_state(role.roleid,game_total_role,game_total_player,width,height)==false)
					{
						next_pos=role.direction_path[0];
						if(maplib.get_pos_movable(game_total_role,next_pos))
						{
							//执行移动
							next_pos=role.direction_path.shift();
							maplib.do_role_move(role.roleid,next_pos,game_total_role,game_total_map,game_user_map,width,height);
							for(uid in game_total_player)
							{
								action_list_dic[uid][step].pos={};
								if(action_list_dic[uid][step-1].insight_roles.indexOf(role.roleid)!=-1||action_list_dic[uid][step].landform_map[next_pos]!=undefined)
								{
									action_list_dic[uid][step].pos[role.roleid]=next_pos;
								}		
							}
						}
					}

				}	
			}
			for(uid in game_total_player)
			{
				//role变化字典
				var insight_roles=maplib.get_roleids_in_sightzoon_of_player(uid,game_total_role,game_total_map,width,height);
				action_list_dic[uid][step].insight_roles=insight_roles;

				//地图变化字典
				action_list_dic[uid][step].landform_map={};
				action_list_dic[uid][step].resource_map={};
				var sightzoon=maplib.getsightzoon_of_player(uid,game_total_role,game_total_map,width,height);
				for(id in sightzoon)
				{
					var zoon_id=sightzoon[id];
					action_list_dic[uid][step].landform_map[zoon_id]=game_total_map.landform_map[zoon_id]*game_user_map[uid].detective_map[zoon_id];
					action_list_dic[uid][step].resource_map[zoon_id]=game_total_map.resource_map[zoon_id]*game_user_map[uid].detective_map[zoon_id];
				}
			}
		}
		else if(step==5)
		{
			//执行攻击
			continue;
		}
		else if(step==6)
		{
			//执行撤退
			continue;
		}
		
		
	}
	// var user_action_list=[];
	// for(step in action_list)
	// {
	// 	for(uid in game_total_player)
	// 	{
	// 		if(step==1||step==2||step==3||step==4)
	// 		{
	// 			if()
	// 		}
	// 	}
		
	// }
	return action_list_dic;
}

//all_roles_dic为本局游戏中的全部role的字典
var check_pos_movable=function(all_roles_dic,des_pos_id)
{
	var movable=true;
	for(roleid in all_roles_dic)
	{
		if(all_roles_dic[roleid].pos_id==des_pos_id)
		{
			movable=false;
			break;
		}
	}
	return movable;
}

//随机排序函数
var get_random=function(a,b)
{
	return Math.random()>0.5 ? -1 : 1; 
}

// var check_pos_movable=function(gameid,des_pos_id,callback)
// {
// 	var movable=true;

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
// 		sql="select * from game_total_role as r,game_total_player as p where r.uid=p.uid and p.gameid=?";
// 		connection.query(sql,[gameid],(err,rows)=>{
// 			if(rows)
// 			{
// 				for(i in rows)
// 				{
// 					if(rows[i].pos_id==des_pos_id)
// 					{
// 						movable=false;
// 						break;
// 					}
// 				}

// 			}
// 			cb(err);
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		connection.commit((err)=>{
// 			cb(err);
// 		});
// 	});


// 	async.waterfall(funcs,(err,result)=>{
// 		if(err)
// 		{
// 			connection.rollback((err_rollback)=>{
// 				connection.release();
// 				callback("error!");
// 			});
// 		}
// 		else
// 		{
// 			connection.release();
// 			callback(movable);
// 		}
// 	});
// }

