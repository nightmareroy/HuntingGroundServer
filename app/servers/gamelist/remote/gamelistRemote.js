module.exports = function(app) {
	return new GamelistRemote(app);
};

var GamelistRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var logger = require('pomelo-logger').getLogger(__filename);

var pomelo = require('pomelo');
// var defaultDataManager=require('../../../defaultdata/defaultDataManager');
var defaultDataManager=pomelo.app.get('defaultDataManager');

var async=require('async');

//
//	gamedic:
//	creator_id:
//		'game':
//			'creator_id':
//			'game_name':
//			'gametype_id':
//	
//		'players':
//			uid:
//				'uid':uid
//				'name':'name',
//				'group_id':1,
//		
//		
//
//	user_creator_dic:
//		uid:creator_id
var gamedic={};
var user_creator_dic={};

const CreateMultiGame="CreateMultiGame";
const CancelMultiGame="CancelMultiGame";
const JoinMultiGame="JoinMultiGame";
const LeaveMultiGame="LeaveMultiGame";
const MultiGameStart="MultiGameStart";


//进入游戏大厅
GamelistRemote.prototype.onEnterGameHall = function(frontendId,uid,cb)
{
	var channel = this.channelService.getChannel(0, true);
	if(channel.records[uid]==undefined)
	{
		channel.add(uid, frontendId);
	}
	else
	{
		console.log('already in game hall');
	}

	// console.log('menbers:');
	// console.log(channel.groups);

	cb(gamedic);
	
}

//离开游戏大厅,如果是游戏创建者,就删除游戏,如果已加入某个游戏,则离开游戏
GamelistRemote.prototype.onLeaveGameHall = function(frontendId,uid,cb)
{
	var channel = this.channelService.getChannel(0, true);
	if(channel.records[uid]!=undefined)
	{
		channel.leave(uid, frontendId);

		// console.log('members:');
		// console.log(channel.groups);
		
		if(gamedic[uid]!=undefined)
		{
			delete gamedic[uid];
			delete user_creator_dic[uid];

			var param = {
				route: CancelMultiGame,
				code:200,
				data:{
					creator_id:uid,
					is_start:false
				}
			};
			var channel = this.channelService.getChannel(0, true);
			channel.pushMessage(param,cb);
		}
		else if(user_creator_dic[uid]!=undefined)
		{
			var creator_id=user_creator_dic[uid];
			delete gamedic[creator_id].players[uid];
			delete user_creator_dic[uid];

			var param = {
				route: LeaveMultiGame,
				code:200,
				data:{
					creator_id:creator_id,
					uid:uid,
				}
			};
			var channel = this.channelService.getChannel(0, true);
			channel.pushMessage(param,cb);
		}
		

		// if(creator_id!=undefined)
		// {
		// 	var param;

		// 	if(uid==creator_id)
		// 	{
		// 		delete gamedic[uid];
		// 		console.log('gamedic:');
		// 		console.log(gamedic);

		// 		param = {
		// 			route: CancelMultiGame,
		// 			code:200,
		// 			data:{
		// 				creator_id:creator_id,
		// 				is_start:false
		// 			}
		// 		};
		// 	}
		// 	else
		// 	{
		// 		delete gamedic[creator_id].players[uid];
		// 		console.log('gamedic:');
		// 		console.log(gamedic);

		// 		param = {
		// 			route: LeaveMultiGame,
		// 			code:200,
		// 			data:{
		// 				creator_id:creator_id,
		// 				uid:uid,
		// 			}
		// 		};
		// 	}

		// 	var channel = this.channelService.getChannel(0, true);
		// 	channel.pushMessage(param,cb);
		// }
		// cb();
	}
	cb();
	

	
}

//多人离开游戏大厅(属于同一个游戏creator_id),并删除游戏
GamelistRemote.prototype.onMultiLeaveGameHall = function(frontendId,creator_id,cb)
{
	var channel = this.channelService.getChannel(0, true);

	// for(uid in uid_list)
	// {
	// 	if(channel.records[uid]==undefined)
	// 	{
	// 		cb('some user not in that game!');
	// 		return;
	// 	}
	// }
	// for(uid in uid_list)
	// {
	// 	channel.leave(uid, frontendId);
	// }
	// console.log('menbers:');
	// console.log(channel.groups);

	if(gamedic[creator_id]!=undefined)
	{


		for(uid_t in gamedic[creator_id].players)
		{
			// sid_dic[uid_t]=channel.records[uid_t].sid;
			channel.leave(uid_t, channel.records[uid_t].sid);
			delete user_creator_dic[uid_t];
		}
		delete gamedic[creator_id];
		// console.log('gamedic:');
		// console.log(gamedic);

		var param = {
			route: CancelMultiGame,
			code:200,
			data:{
				creator_id:creator_id,
				is_start:true
			}
		};
		channel.pushMessage(param,()=>{
			cb();
		});
	}
	else
	{
		//此游戏不存在
		cb("err");
	}

	
}

// //发送游戏开始通知
// GamelistRemote.prototype.MultiGameStart = function(creator_id,cb)
// {
// 	var channel = this.channelService.getChannel(0, true);

// 	var uids=[];
// 	for(uid_t in gamedic[creator_id].players)
// 	{
// 		uids.push(channel.records[uid_t]);
// 	}
// 	this.channelService.pushMessageByUids(MultiGameStart, {
// 		code:200,
// 		data:null
// 	}, uids, ()=>{
// 		cb();
// 	});



// }


//玩家session中加入路由信息，发送游戏开始通知，玩家移出频道，删除游戏数据,通知频道内玩家游戏已删除
GamelistRemote.prototype.MultiGameStart = function(creator_id,gamedata_sid,gamechannel_sid,callback)
{
	var channel = this.channelService.getChannel(0, true);


	var funcs=[];

	//设置session
	funcs.push((cb)=>{
		var sub_funcs=[];
		for(uid_t in gamedic[creator_id].players)
		{
			(()=>{
				var uid=uid_t;

				
				var backendSession;
				sub_funcs.push((sub_cb)=>{
					this.app.backendSessionService.getByUid(channel.records[uid].sid,uid,(err,bs)=>{
						backendSession=bs[0];
						sub_cb();
					});
				});

				sub_funcs.push((sub_cb)=>{
					// console.log(backendSession);
					backendSession.set('creator_id',creator_id);
					backendSession.set('gamedata_sid',gamedata_sid);
					backendSession.set('gamechannel_sid',gamechannel_sid);
					backendSession.pushAll(()=>{
						sub_cb();
					});
				});



				
			})();
			
		}
		async.waterfall(sub_funcs,(err,result)=>{
			cb(err);
		});
		
	});

	//发送开始通知
	funcs.push((cb)=>{
		var uids=[];
		for(uid_t in gamedic[creator_id].players)
		{
			uids.push(channel.records[uid_t]);
		}
		this.channelService.pushMessageByUids(MultiGameStart, {
			code:200,
			data:null
		}, uids, ()=>{
			cb();
		});
	});

	//移出频道并删除数据
	funcs.push((cb)=>{
		for(uid_t in gamedic[creator_id].players)
		{
			// sid_dic[uid_t]=channel.records[uid_t].sid;
			channel.leave(uid_t, channel.records[uid_t].sid);
			delete user_creator_dic[uid_t];
		}
		delete gamedic[creator_id];
		cb();
	});

	//通知频道内玩家，游戏已删除
	funcs.push((cb)=>{
		var param = {
			route: CancelMultiGame,
			code:200,
			data:{
				creator_id:creator_id,
				is_start:true
			}
		};
		channel.pushMessage(param,()=>{
			cb();
		});
	});

	async.waterfall(funcs,(err,result)=>{
		callback(err);
	});


}


//创建游戏
GamelistRemote.prototype.onCreateMultiGame = function(uid,name,game_name,gametype_id,group_id,cb)
{
	if(gamedic[uid]!=undefined)
	{
		cb('already create a game!');
		return;
	}
	gamedic[uid]={
		game:{
			creator_id:uid,
			game_name:game_name,
			gametype_id:gametype_id
			
		},
		players:{}
		
	};
	gamedic[uid].players[uid]={
		uid:uid,
		name:name,
		group_id:group_id
	};
	user_creator_dic[uid]=uid;
	// console.log('gamedic:');
	// console.log(gamedic);

	var channel = this.channelService.getChannel(0, true);

	var param = {
		route: CreateMultiGame,
		code:200,
		data:gamedic[uid]
	};
	channel.pushMessage(param,cb);
	
};

//注销游戏
GamelistRemote.prototype.onCancelMultiGame = function(creator_id,cb)
{
	if(gamedic[creator_id]==undefined)
	{
		cb('the game does not exist!');
		return;
	}

	for(uid_t in gamedic[creator_id].players)
	{
		delete user_creator_dic[uid_t];
	}
	delete gamedic[creator_id];
	

	// console.log('gamedic:');
	// console.log(gamedic);

	var channel = this.channelService.getChannel(0, true);

	var param = {
		route: CancelMultiGame,
		code:200,
		data:{
				creator_id:creator_id,
				is_start:false
		}
	};
	channel.pushMessage(param,cb);
	
};

//加入游戏
GamelistRemote.prototype.onJoinMultiGame = function(creator_id,uid,name,cb)
{
	if(gamedic[creator_id]==undefined)
	{
		cb('the game does not exist!');
		return;
	}
	if(gamedic[creator_id].players[uid]!=undefined)
	{
		cb('already in that game!');
		return;
	}

	var gametype=defaultDataManager.get_d_gametype(gamedic[creator_id].gametype_id);
	var temp_p_count=gametype.playercount_in_group.slice(0);
	var group_id;
	for(uid_temp in gamedic[creator_id].players)
	{
		temp_p_count[gamedic[creator_id].players[uid_temp].group_id-1]--;
		
	}
	for(i in temp_p_count)
	{
		if(temp_p_count[i]>0)
		{
			group_id=parseInt(i)+1;
			break;
		}
	}
	if(group_id==undefined)
	{
		cb('the game is full!')
		return;
	}

	gamedic[creator_id].players[uid]={
		uid:uid,
		name:name,
		group_id:group_id
	};
	user_creator_dic[uid]=creator_id;

	// console.log('gamedic:');
	// console.log(gamedic);

	var channel = this.channelService.getChannel(0, true);

	var param = {
		route: JoinMultiGame,
		code:200,
		data:{
			creator_id:creator_id,
			uid:uid,
			name:name,
			group_id:group_id
		}
	};
	channel.pushMessage(param,cb);
	
};

//离开游戏
GamelistRemote.prototype.onLeaveMultiGame = function(creator_id,uid,cb)
{
	if(gamedic[creator_id]==undefined)
	{
		cb('the game does not exist!');
		return;
	}
	if(gamedic[creator_id].players[uid]==undefined)
	{
		cb('does not in that game!');
		return;
	}
	delete gamedic[creator_id].players[uid];
	delete user_creator_dic[uid];

	// console.log('gamedic:');
	// console.log(gamedic);

	var channel = this.channelService.getChannel(0, true);

	var param = {
		route: LeaveMultiGame,
		code:200,
		data:{
			creator_id:creator_id,
			uid:uid,
		}
	};
	channel.pushMessage(param,cb);
	
};


//注销或离开游戏
GamelistRemote.prototype.onCancelOrLeaveMultiGame = function(uid,cb)
{console.log(gamedic);
	var creator_id=user_creator_dic[uid];
	console.log(creator_id);
	if(gamedic[creator_id]==undefined)
	{
		cb('the game does not exist!');
		return;
	}
	if(gamedic[creator_id].players[uid]==undefined)
	{
		cb('the uid is not in that game!');
		return;
	}

	var channel = this.channelService.getChannel(0, true);
	var param;

	if(creator_id==uid)
	{
		for(uid_t in gamedic[creator_id].players)
		{
			delete user_creator_dic[uid_t];
		}
		delete gamedic[creator_id];
		// console.log('gamedic:');
		// console.log(gamedic);

		param = {
			route: CancelMultiGame,
			code:200,
			data:{
				creator_id:creator_id,
				is_start:false
			}
		};
		
	}
	else
	{
		delete gamedic[creator_id].players[uid];
		delete user_creator_dic[uid];
		// console.log('gamedic:');
		// console.log(gamedic);

		param = {
			route: LeaveMultiGame,
			code:200,
			data:{
				creator_id:creator_id,
				uid:uid,
			}
		};
	}
	channel.pushMessage(param,cb);
}

//获取指定创建者创建的游戏
GamelistRemote.prototype.getMultiGameByCreatorId = function(creator_id,cb)
{
	cb(gamedic[creator_id]);
}

//通知所有玩家游戏开始
// GamelistRemote.prototype.onGameStart=function(gameid,gametypeid,creatorid,current_turn,game_total_player,game_total_role,game_total_map,game_user_map,cb)
// {

// 	var gametype=defaultDataManager.get_d_gametype(gametypeid);
// 	var width=gametype.width;
// 	var height=gametype.height;

// 	var data_dic={};

// 	for(uid in game_total_player)
// 	{
// 		data_dic[uid]={};
// 		data_dic[uid].gameid=gameid;
// 		data_dic[uid].gametype=gametype;
// 		data_dic[uid].current_turn=current_turn;
// 		data_dic[uid].creatorid=creatorid;
// 		data_dic[uid].mapinfo={};
// 		data_dic[uid].allplayers_dic=game_total_player;
		


// 		for(pos_id in game_total_map[uid].landform_map)
// 		{
// 			data_dic[uid].mapinfo.landform_map[pos_id]=game_total_map.landform_map[pos_id]*game_user_map[uid].detective_map[pos_id];
// 			data_dic[uid].mapinfo.resource_map[pos_id]=game_total_map.resource_map[pos_id]*game_user_map[uid].detective_map[pos_id];
// 			data_dic[uid].mapinfo.width=width;
// 			data_dic[uid].mapinfo.height=height;
// 		}

// 		data_dic[uid].role_dic=gamelib.get_roles_in_sightzoon_of_player(uid,game_total_role,game_total_map,width,height)

// 		this.channelService.pushMessageByUids(GameStart, {
// 			code:200,
// 			data:data_dic
// 		}, [uid], ()=>{});
		
// 	}
// }