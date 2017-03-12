module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var handler = Handler.prototype;



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
handler.CreateGame=function(gameinfo,cb)
{
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);

	gamedic[gameinfo.game.creator_id]=gameinfo;
	gameinfo.game.current_turn=1;
	gameinfo.map={
		landform:[],
		resource:[]
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
			
	}

	//roles
	gameinfo.roles={};

	//buildings
	gameinfo.buildings={};

	//players
	for(uid in gameinfo.players)
	{
		var player=gameinfo.players[uid];

		player.direction_turn=1;
		player.banana=1000;

		//每位玩家都有自己的地图及建筑信息的备份，并且备份数据与真实数据是不一样的，因为视野之外的地图及建筑信息不能更新，所以需要做假数据
		player.map={
			landform:[],
			resource:[]
		};
		player.buildings={};

		//初始化map
		for(var i=0;i<gametype.width*gametype.height;i++)
		{
			player.map.landform.push(0);
			player.map.resource.push(0);
		}
	}

	


	//初始化单位
	switch(gameinfo.game.gametype_id)
	{
		case 1:
			switch(gameinfo.game.progress_id)
			{
				case 1:
					gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+3);
					gamelib.create_role(gameinfo,gameinfo.game.creator_id,2,Math.floor(gametype.width*gametype.height/2)+6);
					break;
			}
			break;
		case 2:
			break;
	}

	// console.log(gameinfo)
	cb(gameinfo);

}

//获取用户游戏数据
handler.GetGameInfo=function(creator_id,uid,cb)
{
	var gameinfo=gamedic[creator_id];
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);

	var gameinfo_user={};
	gameinfo_user.game=gameinfo.game;
	gameinfo_user.roles=maplib.get_roles_in_sightzoon_of_player(uid,gameinfo);
	// console.log(gameinfo_user.roles);
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



// //返回游戏数据，加入游戏频道
// handler.LoadGame=function(uid,creator_id,cb)
// {

// 	var roles_in_sightzoon=maplib.get_roles_in_sightzoon_of_player(uid,game_total_role,game_total_map,gametype);

// 	cb(gamedic[creator_id]);
// }

//执行游戏回合,返回行动列表
handler.NextTurn=function(creator_id,uid,direction,current_turn,cb)
{
	var gameinfo=gamedic[creator_id];

	for(role_id in direction)
	{
		if(gameinfo.roles[role_id].uid==uid)
		{
			gameinfo.roles[role_id].direction_did=direction[role_id].direction_did;
			gameinfo.roles[role_id].direction_param=direction[role_id].direction_param;
		}
		
	}

	all_ready=true;
	for(uid in gameinfo.players)
	{
		var player=gameinfo.players[uid];
		if(player.direction_turn!=gameinfo.game.current_turn)
		{
			all_ready=false;
			break;
		}
	}

	if(all_ready==false)
	{
		cb();
		return;
	}
	else
	{
		var action_list_dic=gamelib.executedirection(gameinfo);
		cb(action_list_dic);
	}

	
}

//放弃当前游戏,
handler.FailGame=function(creator_id,uid,callback)
{
	var gameinfo=gamedic[creator_id];
	//删数据
	delete gameinfo.players[uid];
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

	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);

	var result;
	switch(gameinfo.gametype_id)
	{
		case 1:
			result={};
			break;
		case 2:
			//如果只剩一个玩家，则游戏结束
			if(gameinfo.players.length==1)
			{
				var winner_uid;
				for(uid_t in gameinfo.players)
				{
					winner_uid=uid_t;
				}
				result={
					winner_uid:winner_uid
				};
				delete gamedic[creator_id];
			}
			break;
		case 3:
			break;
	}

	
	callback(result);
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






