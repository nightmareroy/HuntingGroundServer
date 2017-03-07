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

/**
 * user join into chat game channel.
 * 
 *
 */
GameRemote.prototype.EnterGameChannel=function(uid,game_id,frontendId,cb)
{

	if(userChannelDic[uid]==undefined)
	{
		var channel = this.channelService.getChannel(game_id, true);
		channel.add(uid, frontendId);
		userChannelDic[uid]=game_id;

		logger.info(uid);
		logger.info("enter game channel:");
		logger.info(game_id);
	}
	else
	{
		logger.info("already in the game channel");
	}

	cb();
	
}


/**
 * Kick user out chat game channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 *
 */
GameRemote.prototype.LeaveGameChannel = function(uid,cb)
{
	var game_id=userChannelDic[uid];
	if(game_id!=undefined)
	{
		var channel = this.channelService.getChannel(game_id, true);
		var frontendId=channel.records[uid].sid;
		channel.leave(uid, frontendId);
		delete userChannelDic[uid];

		var left_members=channel.getMembers();
		if(left_members.length==0)
		{
			channel.destroy();
		}
		logger.info(uid);
		logger.info("leave game channel:");
		logger.info(game_id);
		
	}
	cb();
	
};

// //通知游戏频道内所有玩家，游戏开始，并发送游戏数据
// GameRemote.prototype.broadcast_start_and_gameinfo=function(gameid,callback)
// {
// 	var gametype;
// 	var current_turn;
// 	var creatorid;

// 	var game_total_player={};
// 	var game_total_role={};
// 	var game_total_map;
// 	// var roles_in_sightzoon={};

// 	// var mapinfo={
// 	// 	landform_map:[],
// 	// 	resource_map:[],
// 	// 	width:0,
// 	// 	height:0
// 	// };
	
// 	var game_user_map=[];

// 	var mapsizeid;
// 	var width;
// 	var height;

// 	var data_dic={};

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
// 		sql="select * from game where gameid=?";
// 		connection.query(sql,[gameid],(err,rows)=>{
// 			if(rows)
// 			{
// 				var game=rows[0];
// 				gametype=game.gametype;
// 				current_turn=game.current_turn;
// 				creatorid=game.creatorid;
// 			}
// 			cb(err);
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		sql="select * from game_total_player where gameid=?";
// 		connection.query(sql,gameid,(err,rows)=>{
// 			if(rows)
// 			{
// 				for(i in rows)
// 				{
// 					game_total_player[rows[i].uid]={};
// 					game_total_player[rows[i].uid].uid=rows[i].uid;
// 					game_total_player[rows[i].uid].groupid=rows[i].groupid;
// 					game_total_player[rows[i].uid].direction_turn=rows[i].direction_turn;
// 				}

// 			}
// 			cb(err);
// 		});
// 	});
	
// 	// funcs.push((cb)=>{
// 	// 	var gametypedetail=defaultDataManager.get_d_gametype(gametype);
// 	// 	playercount_in_group=gametypedetail.playercount_in_group;
// 	// 	npccount_in_group=gametypedetail.npccount_in_group;
// 	// 	cb();
// 	// });
// 	funcs.push((cb)=>{
// 		sql="select * from game_total_map where gameid=?";
// 		connection.query(sql,[gameid],(err,rows)=>{
// 			if(rows)
// 			{
// 				game_total_map=rows[0];
// 				game_total_map.landform_map=JSON.parse(game_total_map.landform_map);
// 				game_total_map.resource_map=JSON.parse(game_total_map.resource_map);
				
// 				mapsizeid=game_total_map.mapsizeid;

// 			}
// 			cb(err);
// 		});
// 	});
// 	funcs.push((cb)=>{
// 		var mapsize=defaultDataManager.get_d_mapsize(mapsizeid);
// 		width=mapsize.width;
// 		height=mapsize.height;
// 		cb();
// 	});
// 	funcs.push((cb)=>{
// 		sql="select * from game_user_map as m,game_total_player as p where p.uid=m.uid and p.gameid=?";
// 		connection.query(sql,gameid,(err,rows)=>{
// 			if(rows)
// 			{
// 				var map=rows;
// 				for(i in rows)
// 				{
// 					game_user_map[rows[i].uid]=rows[i];
// 					game_user_map[rows[i].uid].detective_map=JSON.parse(rows[i].detective_map);
// 				}
// 			}
// 			cb(err);
// 		});
// 	});
	
// 	funcs.push((cb)=>{
// 		sql="select * from game_total_role as r,game_total_player as p where r.uid=p.uid and p.gameid = ?";
// 		connection.query(sql,gameid,(err,rows)=>{
// 			if(rows)
// 			{
// 				for(i in rows)
// 				{
// 					game_total_role[rows[i].roleid]=rows[i];
					
					
// 				}
// 				// roles_in_sightzoon=maplib.get_roles_in_sightzoon_of_player(uid,game_total_role,game_total_map,mapinfo.width,mapinfo.height)

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
// 		for(uid in game_total_player)
// 		{
// 			data_dic[uid]={};
// 			data_dic[uid].gameid=gameid;
// 			data_dic[uid].gametype=gametype;
// 			data_dic[uid].current_turn=current_turn;
// 			data_dic[uid].creatorid=creatorid;
// 			data_dic[uid].mapinfo={};
// 			data_dic[uid].allplayers_dic=game_total_player;
			


// 			for(pos_id in game_total_map[uid].landform_map)
// 			{
// 				data_dic[uid].mapinfo.landform_map[pos_id]=game_total_map.landform_map[pos_id]*game_user_map[uid].detective_map[pos_id];
// 				data_dic[uid].mapinfo.resource_map[pos_id]=game_total_map.resource_map[pos_id]*game_user_map[uid].detective_map[pos_id];
// 				data_dic[uid].mapinfo.width=width;
// 				data_dic[uid].mapinfo.height=height;
// 			}

// 			data_dic[uid].role_dic=gamelib.get_roles_in_sightzoon_of_player(uid,game_total_role,game_total_map,width,height)

// 			channelService.pushMessageByUids("game_start", {
// 				code:200,
// 				data:data_dic
// 			}, [uid], ()=>{});
			
// 		}
// 		cb();


// 	});

	
	



// 	async.waterfall(funcs,(err,result)=>{
// 		if(err)
// 		{
// 			connection.rollback((err_rollback)=>{
// 				connection.release();
// 				console.log("broadcast_start_and_gameinfo err!");
// 				// next(
// 				// 	null,
// 				// 	{
// 				// 		code:500,
// 				// 		data:"can't get gameinfo!"
// 				// 	}
// 				// )
// 			});
// 		}
// 		else
// 		{
// 			connection.release();
// 		}
// 	});
// }

// //玩家加入游戏
// GameRemote.prototype.joingame=function(gameid,uid,route,cb)
// {
	
// }

GameRemote.prototype.BroadcastActions = function(game_id,action_list_dic,cb)
{
	var channel = this.channelService.getChannel(game_id, false);

	for(uid in action_list_dic)
	{
		if(channel.records[uid]!=undefined)
		{
			this.channelService.pushMessageByUids(DoAction, {
				code:200,
				data:action_list_dic[uid]
			}, [channel.records[uid]], ()=>{});
		}
		
	}

	cb();
	
};

GameRemote.prototype.BroadcastPlayerFail = function(uid,cb)
{
	var game_id=userChannelDic[uid];
	var channel = this.channelService.getChannel(game_id, false);
	console.log(game_id);
	channel.pushMessage(PlayerFail,{
		code:200,
		data:{
			uid:uid
		}
	},()=>{
		cb();
	});

	
	
};

GameRemote.prototype.test=function(gameid,cb)
{
	var channel = this.channelService.getChannel(gameid, false);

	if( !! channel) {


		var param = {
			route: "test",
			code:200
		};
		channel.pushMessage(param);

		// channel.pushMessage('allPlayerReady',{msg:'msgggg'});
	}
	cb();
}



// GameRemote.prototype.EnterGameChannel=function(uid,frontendId,creator_id,cb)
// {
// 	var channel = this.channelService.getChannel(creator_id, true);

// 	if(channel.records[uid]==undefined)
// 	{
// 		channel.add(uid, frontendId);
		
		
// 	}
// 	else
// 	{
// 		console.log('already in game');
// 	}
// 	cb();
// }

// GameRemote.prototype.LeaveGameChannel=function(uid,frontendId,creator_id,cb)
// {
// 	var channel = this.channelService.getChannel(creator_id, true);

// 	if(channel.records[uid]!=undefined)
// 	{
// 		channel.leave(uid, frontendId);
		
		
// 	}
// 	else
// 	{
// 		console.log('not in game');
// 	}
// 	cb();
// }



