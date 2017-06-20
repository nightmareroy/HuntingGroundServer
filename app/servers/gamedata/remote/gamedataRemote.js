module.exports = function(app) {
	return new GamedataRemote(app);
};

var GamedataRemote = function(app) {
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
var db=pomelo.app.get('db');

var defaultDataManager=pomelo.app.get('defaultDataManager');
var uuid=require('uuid');

//	gamedic:
//	creator_id:
//		'game':
//			'creator_id':
//			'game_name':
//			'gametype_id':
//			'current_turn':
//		'map':
//			'landform':
//			'resource':
//		'players':
//			uid:
//				'uid':uid
//				'name':'name',
//				'group_id':1,
//				'direction_turn':
//				'banana':
//				'map':
//		'roles':
//		'buildings':

var gamedic={};



////////////////////////////////////gameinfo/////////////////////////////
//创建游戏数据，加入列表
GamedataRemote.prototype.CreateGame=function(gameinfo,cb)
{
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);

	gamedic[gameinfo.game.creator_id]=gameinfo;
	gameinfo.game.current_turn=1;
	// gameinfo.game.win_condition="30回合内达到1000总体重";
	gameinfo.map={
		landform:[],
		resource:[],
		meat:[]
	};

	gameinfo.names_left=[];

	var d_names_dic=defaultDataManager.get_d_names_dic();
	for(name_id in d_names_dic)
	{
		gameinfo.names_left.push(name_id);
	}
	gameinfo.names_left.sort(get_random);

	//map
	for(var i=0;i<gametype.width*gametype.height;i++)
	{
		var random_l=Math.random();
		var random_r=Math.random();
		var random_m=Math.random();
		if(random_l>0.4)
		{
			//平地
			gameinfo.map.landform.push(1);
		}
		else if(random_l>0.2)
		{
			//丘陵
			gameinfo.map.landform.push(2);
		}
		else
		{
			//山脉
			gameinfo.map.landform.push(3);
		}

		if(gameinfo.map.landform[i]!=3)
		{
			if(random_r<0.6)
			{
				//无资源
				gameinfo.map.resource.push(1);
			}
			else if(random_r<0.8)
			{
				//香蕉树
				gameinfo.map.resource.push(2);
			}
			else
			{
				//草丛
				gameinfo.map.resource.push(3);
			}
		}
		else
		{
			//无资源
			gameinfo.map.resource.push(1);
		}

		//肉图的id需要乘以100，前两位作为存在的回合数
		// var d_meat=defaultDataManager.get_d_meat()
		// if(random_m>0.85)
		// {
		// 	//白蚁
		// 	var d_meat=defaultDataManager.get_d_meat(3);
		// 	gameinfo.map.meat.push(d_meat.meat_id*100+d_meat.last_turn);
		// }
		// else if(random_m>0.75)
		// {
		// 	//鸟蛋
		// 	var d_meat=defaultDataManager.get_d_meat(5);
		// 	gameinfo.map.meat.push(d_meat.meat_id*100+d_meat.last_turn);
		// }
		// else
		// {
		// 	//无
		// 	gameinfo.map.meat.push(100);
		// }
		gameinfo.map.meat.push(100);
			
	}

	//roles
	gameinfo.roles={};

	//buildings
	gameinfo.buildings={};

	//players
	for(uid in gameinfo.players)
	{
		var player=gameinfo.players[uid];

		player.direction_turn=0;
		player.banana=0;
		player.meat=0;
		player.branch=0;
		// player.score=0;
		// player.leave=false;

		// player.cook_skill_dic={};
		// for(cook_skill_id in defaultDataManager.get_d_cook_skills)
		// {
		// 	// var cook_method=defaultDataManager.get_d_cook_skills(cook_skill_id);
		// 	player.cook_skill_dic[cook_skill_id]=0;
		// }

		// player.activity=0;

		//每位玩家都有自己的地图及建筑信息的备份，并且备份数据与真实数据是不一样的，因为视野之外的地图及建筑信息不能更新，所以需要做假数据
		player.map={
			landform:[],
			resource:[],
			meat:[]
		};
		player.buildings={};

		//初始化map
		for(var i=0;i<gametype.width*gametype.height;i++)
		{
			player.map.landform.push(0);
			player.map.resource.push(0);
			player.map.meat.push(0);
		}
	}

	


	//初始化单位
	switch(gameinfo.game.gametype_id)
	{
		case 1:
			switch(gameinfo.game.progress_id)
			{
				case 1:
					var father=gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+3);
					// var son=gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+6);
					// father.role.blood_sugar=100;
					// father.role.blood_sugar_max=100;
					// father.role.old=1000;
					// father.role.muscle=200;
					// son.role.blood_sugar=100;
					// son.role.blood_sugar_max=100;
					// son.role.old=0;
					// son.role.muscle=100;

					// gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+7);
					// gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+8);
					// gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+9);
					// gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+10);
					// gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+11);
					// gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+12);
					// gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+13);
					// gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+14);
					// gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+15);
					// gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+16);
					// gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+17);
					break;
			}
			break;
		case 2:
			var pos_ids=[];
			for(uid in gameinfo.players)
			{
				//father
				var random_pos_id;
				do
				{
					random_pos_id=Math.floor(Math.random()*gametype.width*gametype.height);
				}while(pos_ids.indexOf(random_pos_id)!=-1&&maplib.get_pos_movable(random_pos_id,gameinfo))
				pos_ids.push(random_pos_id);
				var father=gamelib.create_role(gameinfo,uid,2,random_pos_id);

				//son
				var neibourids=maplib.get_neibour_ids(gameinfo,random_pos_id);
				var neibourid;
				for(i in neibourids)
				{
					neibourid=neibourids[i];
					if(pos_ids.indexOf(neibourid)!=-1&&maplib.get_pos_movable(neibourid,gameinfo))
					{
						break;
					}
				}
				var son=gamelib.create_role(gameinfo,uid,2,random_pos_id);

				// father.role.blood_sugar=100;
				// father.role.blood_sugar_max=100;
				// father.role.old=1000;
				// father.role.muscle=200;
				// son.role.blood_sugar=100;
				// son.role.blood_sugar_max=100;
				// son.role.old=0;
				// son.role.muscle=100;
			}
			// gamelib.create_role(gameinfo,5,2,Math.floor(gametype.width*gametype.height/2)+3);
			// gamelib.create_role(gameinfo,6,2,Math.floor(gametype.width*gametype.height/2)+6);
			break;
	}

	// console.log(gameinfo)
	cb(gameinfo);

}

//获取用户游戏数据
GamedataRemote.prototype.GetUserGameInfo=function(creator_id,uid,cb)
{
	var gameinfo=gamedic[creator_id];
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);

	var gameinfo_user={};
	gameinfo_user.game=gameinfo.game;
	gameinfo_user.roles=maplib.get_roles_in_sightzoon_of_player(uid,gameinfo);
	
	// console.log(gameinfo.roles);
	gameinfo_user.buildings=gameinfo.players[uid].buildings;
	gameinfo_user.map=gameinfo.players[uid].map;
	gameinfo_user.players={};
	// gameinfo_user.map={
	// 	landform:[],
	// 	resource:[]
	// };
	

	for(uid_t in gameinfo.players)
	{
		var player=gameinfo.players[uid_t];
		var player_user={};
		for(key in player)
		{
			player_user[key]=player[key];
		}
		delete player_user.map;
		delete player_user.buildings;
		//重新定义map
		// player_user.map={};
		// player_user.map.landform=[];
		// player_user.map.resource=[];
		// for(var i=0;i<gametype.width*gametype.height;i++)
		// {
		// 	player_user.map.landform[i]=player.map[i]*gameinfo.map.landform[i];
		// 	player_user.map.resource[i]=player.map[i]*gameinfo.map.resource[i];
		// }

		gameinfo_user.players[player_user.uid]=player_user;

	}

	// for(var i=0;i<gametype.width*gametype.height;i++)
	// {
	// 	gameinfo_user.map.landform[i]=player.map[i]*gameinfo.map.landform[i];
	// 	gameinfo_user.map.resource[i]=player.map[i]*gameinfo.map.resource[i];
	// }
	gameinfo_user.map.sightzoon=maplib.getsightzoon_of_player(uid,gameinfo);


	cb(gameinfo_user);


}

//获取游戏数据
GamedataRemote.prototype.GetGameInfo=function(creator_id,cb)
{
	var gameinfo=gamedic[creator_id];
	cb(gameinfo);
}

// //返回游戏数据，加入游戏频道
// GamedataRemote.prototype.LoadGame=function(uid,creator_id,cb)
// {

// 	var roles_in_sightzoon=maplib.get_roles_in_sightzoon_of_player(uid,game_total_role,game_total_map,gametype);

// 	cb(gamedic[creator_id]);
// }

//执行游戏回合,返回行动列表
GamedataRemote.prototype.CheckNextTurn=function(creator_id,uid,direction,direction_turn,cb)
{
	var gameinfo=gamedic[creator_id];

	//检测输入
	if(!input_check(gameinfo,direction,direction_turn))
	{
		cb("input uncorrect!");
		return;
	}

	//存储指令、更新用户指令turn
	for(role_id in direction)
	{
		if(gameinfo.roles[role_id].uid==uid)
		{
			gameinfo.roles[role_id].direction_did=direction[role_id].direction_did;
			gameinfo.roles[role_id].direction_param=direction[role_id].direction_param;
		}
		
	}
	gameinfo.players[uid].direction_turn=direction_turn;

	// console.log(gameinfo.game.current_turn)

	//检测所有用户指令状态
	all_ready=true;
	for(uid_t in gameinfo.players)
	{
		if(uid_t>=0)
		{
			var player=gameinfo.players[uid_t];
			if(player.direction_turn!=gameinfo.game.current_turn)
			{
				all_ready=false;
				break;
			}
		}
		
	}

	// if(all_ready==false)
	// {
	// 	cb({
	// 		uid:uid,
	// 		// direction_turn:direction_turn,
	// 		action_list_dic:null,
	// 		gameover:null
	// 	});
	// }
	// else
	// {
		
	// }
	cb(all_ready);

	
}


//执行游戏回合,返回行动列表
GamedataRemote.prototype.ExecuteDirection=function(gamedata_sid,creator_id,gamechannel_sid,timeout_sid,callback)
{
	// console.log(creator_id)
	var gameinfo=gamedic[creator_id];
	// console.log(gameinfo)
	//执行指令
	var result=gamelib.executedirection(gameinfo);

	if(result.gameover)
	{
		delete gamedic[creator_id];
	}
	// cb({
	// 	uid:uid,
	// 	action_list_dic:result.action_list_dic,
	// 	gameover:result.gameover
	// });


	this.app.rpc.timeout.timeoutRemote.update_time(timeout_sid,creator_id,gamedata_sid,gamechannel_sid,timeout_sid,(nexttime)=>{
		gameinfo.game.nexttime=nexttime;
		// console.log(result.gameover)
		this.app.rpc.gamechannel.gamechannelRemote.BroadcastActions(gamechannel_sid,creator_id,result.action_list_dic,nexttime,()=>{
			if(!!result.gameover)
			{
				var user;

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
					this.app.rpc.gamechannel.gamechannelRemote.GameOver(gamechannel_sid,creator_id,result.gameover,()=>{
						cb();
					});
				});
				funcs.push((cb)=>{
					this.app.rpc.timeout.timeoutRemote.delete_time(timeout_sid,creator_id,()=>{
						cb();
					});
				});
				funcs.push((cb)=>{
					sql="select * from user where uid =?";
					connection.query(sql,creator_id,(err,rows)=>{
						user=rows[0];
						cb(err);
					});
						
				});
				funcs.push((cb)=>{
					if(gameinfo.game.gametype_id==1&&result.gameover.result.winner_groups.length>0&&user.single_game_progress==gameinfo.game.progress_id&&gameinfo.game.progress_id!=defaultDataManager.get_d_single_game_info_max_progress())
					{
						sql="update user set single_game_progress=single_game_progress+1 where uid =?";
						connection.query(sql,creator_id,(err,rows)=>{
							cb(err);
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
							callback(err);
						});
					}
					else
					{
						connection.commit((err_commit)=>{
							connection.release();
							callback();
						});
						
					}
				});


				// this.app.rpc.gamechannel.gamechannelRemote.GameOver(gamechannel_sid,creator_id,result.gameover,()=>{
				// 	this.app.rpc.timeout.timeoutRemote.delete_time(timeout_sid,creator_id,()=>{
				// 		callback();
				// 	});
				// });
				
				
				
			}
			else
			{
				callback();
			}
		});

	});

		

	


}

//执行游戏回合,返回行动列表
GamedataRemote.prototype.SubTurn=function(creator_id,uid,role_id,direction_did,direction_param,cb)
{
	var gameinfo=gamedic[creator_id];

	//检测输入
	// if(!input_check(gameinfo,direction,direction_turn))
	// {
	// 	cb("input uncorrect!");
	// 	return;
	// }

	

	//执行指令
	var result=gamelib.execute_sub_direction(gameinfo,role_id,direction_did,direction_param);
	cb(result);

	
}

//离开当前游戏
GamedataRemote.prototype.LeaveGame=function(creator_id,uid,callback)
{
	var gameinfo=gamedic[creator_id];
	//删数据
	// delete gameinfo.players[uid];
	// gameinfo.players[uid].failed=true;
	for(role_id in gameinfo.roles)
	{
		if(gameinfo.roles[role_id].uid==uid)
		{
			delete gameinfo.roles[role_id];
		}
	}
	for(building_id in gameinfo.buildings)
	{
		if(gameinfo.buildings[building_id].uid==uid)
		{
			delete gameinfo.buildings[building_id];
		}
	}

	// var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);

	// var all_weight=gamelib.get_all_weight(gameinfo);

	// var result={
	// 	type:0,//0: 玩家离开 1:游戏结束
	// 	data:{}
	// };
	// switch(gameinfo.game.gametype_id)
	// {
	// 	case 1:
	// 		result.type=1;
	// 		result.data.creator_id=uid;
	// 		result.data.winners={};
	// 		result.data.losers={};
	// 		result.data.losers[uid]=all_weight[uid];
	// 		break;
	// 	case 2:
			
	// 		var user_left=Object.keys(gameinfo.players).length;
	// 		for(uid_t in gameinfo.players)
	// 		{
	// 			var player_t=gameinfo.players[uid_t];
	// 			if(player_t.failed==true)
	// 			{
	// 				user_left--;
	// 			}
	// 		}
	// 		//如果只剩一个玩家，则游戏结束
	// 		if(user_left==1)
	// 		{
	// 			result.type=1;
	// 			result.data.creator_id=creator_id;
	// 			result.data.winners={};
	// 			result.data.losers={};


	// 			var winner_uid;
	// 			for(uid_t in gameinfo.players)
	// 			{
	// 				var player_t=gameinfo.players[uid_t];
	// 				if(player_t.failed==true)
	// 				{
	// 					result.data.losers[uid_t]=all_weight[uid_t];
	// 				}
	// 				else
	// 				{
	// 					result.data.winners[uid_t]=all_weight[uid_t];
	// 				}
	// 			}
	// 			delete gamedic[creator_id];
	// 		}
	// 		//如果剩余多余一个玩家，则只是玩家离开
	// 		else
	// 		{
	// 			result.type=0;
	// 			result.data.uid=uid;
	// 		}
	// 		break;
	// 	case 3:
	// 		break;
	// }

	callback(gameinfo);
	// delete userChannelDic[uid];




	// //删session
	// var backendSessionService=this.app.backendSessionService;
	// backendSessionService.getByUid(sid,uid,(err,backendSession)=>{
	// 	backendSession.delete('gamedata_sid');
	// 	backendSession.delete('creator_id');
	// 	backendSession.pushAll(()=>{

	// 		var channel=this.channelService.getChannel(creator_id,false);
	// 		if(channel.records[uid]!=undefined)
	// 		{
	// 			//删channel
	// 			var sid=channel.records[uid].sid;
	// 			channel.leave(uid,sid);
	// 		}
			
	// 		cb();
	// 	});
	// });
}


//随机排序函数
var get_random=function(a,b)
{
	return Math.random()>0.5 ? -1 : 1; 
}

//输出检查
var input_check=function(gameinfo,direction,direction_turn)
{
	if(direction_turn!=gameinfo.game.current_turn)
		return false;

	return true;
}




