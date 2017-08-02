module.exports = function(app) {
	return new FriendRemote(app);
};

var FriendRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var logger = require('pomelo-logger').getLogger(__filename);

var pomelo = require('pomelo');
var uuid=require('uuid');
// var defaultDataManager=require('../../../defaultdata/defaultDataManager');
var defaultDataManager=pomelo.app.get('defaultDataManager');

var async=require('async');

//uid:
//	uid:
//	state: 1游戏中 2空闲
var friends_dic={};

var match_dic={};
// var game_dic={}

const InviteFight="InviteFight";
const CancelInviteFight="CancelInviteFight";
const RefuseInviteFight="RefuseInviteFight";
const FriendGameStart="FriendGameStart";


//进入游戏频道
FriendRemote.prototype.EnterChannel = function(frontendId,uid,cb)
{
	var channel = this.channelService.getChannel(0, true);
	if(channel.records[uid]==undefined)
	{
		channel.add(uid, frontendId);
		friends_dic[uid]={
			uid:uid,
			state:2
		}
		cb();
	}
	else
	{
		cb('already in channel');
	}
}

//离开游戏频道
FriendRemote.prototype.LeaveChannel = function(frontendId,uid,cb)
{
	var channel = this.channelService.getChannel(0, false);
	if(channel.records[uid]!=undefined)
	{
		channel.leave(uid, frontendId);
		delete friends_dic[uid];
		if(!!match_dic[uid])
		{
			delete match_dic[uid];
		}
		cb();
	}
	else
	{
		cb('not in channel');
	}
}

//进入空闲状态
FriendRemote.prototype.ToIdle = function(uid,cb)
{
	var channel = this.channelService.getChannel(0, false);
	if(channel.records[uid]!=undefined)
	{
		friends_dic[uid].state=2;
		cb();
	}
	else
	{
		cb('not in channel');
	}
}

//进入游戏中状态
FriendRemote.prototype.ToFighting = function(uid,cb)
{
	var channel = this.channelService.getChannel(0, false);
	if(channel.records[uid]!=undefined)
	{
		friends_dic[uid].state=1;
		cb();
	}
	else
	{
		cb('not in channel');
	}
}

//区分用户状态
FriendRemote.prototype.GetStates = function(friends,cb)
{
	var channel = this.channelService.getChannel(0, false);

	var friends_list=[];
	// var friends_idle={};
	// var friends_fighting={};
	// var friends_offline={};

	for(uid in friends)
	{
		var friend=friends[uid];

		if(channel.records[uid]==undefined)
		{
			friend.state=0;
		}
		else if(friends_dic[uid].state==1)
		{
			friend.state=1;
		}
		else if(friends_dic[uid].state==2)
		{
			friend.state=2;
		}
		friends_list.push(friend);
	}

	// friends_list.sort(sort_friend);
	// console.log(friends_dic);
	cb(friends_list);
	// cb({
	// 	friends_idle:friends_idle,
	// 	friends_fighting:friends_fighting,
	// 	friends_offline:friends_offline
	// });
}

// var sort_friend=function(uid_a,uid_b)
// {
// 	return friends_dic[uid_a].state-friends_dic[uid_b].state;
// }


//邀请对战
FriendRemote.prototype.InviteFight = function(src_uid,tar_uid,cb)
{
	var channel = this.channelService.getChannel(0, false);

	if(!!friends_dic[src_uid]&&!!friends_dic[tar_uid])
	{
	
		if(friends_dic[src_uid].state==2&&friends_dic[tar_uid].state==2)
		{
			match_dic[src_uid]=tar_uid;

			this.app.backendSessionService.getByUid(channel.records[src_uid].sid,src_uid,(err,backendSessions)=>{
				var backendSession=backendSessions[0];

				this.channelService.pushMessageByUids(InviteFight,{
					code:200,
					data:{
						src_uid:src_uid,
						name:backendSession.get('user_name')
					}
				},[channel.records[tar_uid]],cb);

			})

			
			
			// cb();
		}
		else
		{
			cb("用户忙");
		}
	}
	else
	{
		cb("用户不在线");
	}
}

//取消邀请对战
FriendRemote.prototype.CancelInviteFight = function(src_uid,tar_uid,cb)
{
	var channel = this.channelService.getChannel(0, false);

	if(match_dic[src_uid]==tar_uid)
	{
		delete match_dic[src_uid];

		if(!!friends_dic[tar_uid])
		{
			

			this.channelService.pushMessageByUids(CancelInviteFight,{
				code:200,
				data:{
					src_uid:src_uid
				}
			},[channel.records[tar_uid]],cb);

		}
		else
		{
			cb();
		}
	}
	else
	{
		cb("未邀请");
	}
}

//同意对战邀请,生成游戏最初数据
FriendRemote.prototype.AgreeInviteFight = function(src_uid,tar_uid,cb)
{
	var channel = this.channelService.getChannel(0, false);

	if(!!friends_dic[src_uid]&&!!friends_dic[tar_uid])
	{
		if(friends_dic[src_uid].state==2&&friends_dic[tar_uid].state==2)
		{
			if(match_dic[src_uid]==tar_uid)
			{
				delete match_dic[src_uid];

				var gameinfo={
					game:{
						game_id:uuid.v1(),
						creator_id:src_uid,
						gametype_id:2
						// win_condition:"50回合内达到1000总体重,或对手总体重为0"
					},
					players:{}
					
				};

				var gamedata_sid;
				var gamechannel_sid;

				var funcs=[];
				//选择gamedata gamechannel服务器
				funcs.push((cb)=>{
					var gamedataServers = this.app.getServersByType('gamedata');
					var gamechannelServers = this.app.getServersByType('gamechannel');
					var timeoutServers=this.app.getServersByType('timeout');
					gamedata_sid=gamedataServers[gameinfo.game.creator_id%gamedataServers.length].id;
					gamechannel_sid=gamechannelServers[gameinfo.game.creator_id%gamechannelServers.length].id;
					timeout_sid=timeoutServers[gameinfo.game.creator_id%timeoutServers.length].id;
					// gameinfo.game.gamedata_sid=gamedata_sid;
					// gameinfo.game.gamechannel_sid=gamechannel_sid;
					gameinfo.game.gamedata_sid=gamedata_sid;
					gameinfo.game.gamechannel_sid=gamechannel_sid;
					gameinfo.game.timeout_sid=timeout_sid;
					cb();
				});

				//更新游戏数据，绑定路由到session
				funcs.push((cb)=>{
					this.app.backendSessionService.getByUid(channel.records[src_uid].sid,src_uid,(err,backendSessions)=>{
						var backendSession=backendSessions[0];

						gameinfo.players[src_uid]={
							uid:src_uid,
							name:backendSession.get('user_name'),
							group_id:1,
							actived_food_ids:backendSession.get('actived_food_ids'),
							frontendId:channel.records[src_uid].sid
						};
						backendSession.set('game_id',gameinfo.game.game_id);
						backendSession.set('gamedata_sid',gamedata_sid);
						backendSession.set('gamechannel_sid',gamechannel_sid);
						backendSession.set('timeout_sid',timeout_sid);
						backendSession.pushAll(()=>{
							cb(err);
						});
						
					});
				});
				funcs.push((cb)=>{
					this.app.backendSessionService.getByUid(channel.records[tar_uid].sid,tar_uid,(err,backendSessions)=>{
						var backendSession=backendSessions[0];

						gameinfo.players[tar_uid]={
							uid:tar_uid,
							name:backendSession.get('user_name'),
							group_id:2,
							actived_food_ids:backendSession.get('actived_food_ids'),
							frontendId:channel.records[tar_uid].sid
						};
						backendSession.set('game_id',gameinfo.game.game_id);
						backendSession.set('gamedata_sid',gamedata_sid);
						backendSession.set('gamechannel_sid',gamechannel_sid);
						backendSession.set('timeout_sid',timeout_sid);
						backendSession.pushAll(()=>{
							cb(err);
						});
					});
				});


				// //创建并加入游戏频道
				// funcs.push((cb)=>{
				// 	this.app.rpc.gamechannel.gamechannelRemote.CreateGameChannel(gamechannel_sid,gameinfo,()=>{
				// 		cb();
				// 	});
				// });
	
				//加入计时器
				funcs.push((cb)=>{
					this.app.rpc.timeout.timeoutRemote.start_time(timeout_sid,gameinfo.game.game_id,gamedata_sid,gamechannel_sid,timeout_sid,(nexttime)=>{
						gameinfo.game.nexttime=nexttime;
						cb();
					})
				});
				

				//在游戏数据服务器中创建游戏数据
				funcs.push((cb)=>{
					this.app.rpc.gamedata.gamedataRemote.CreateGame(gamedata_sid,gameinfo,(gameinfo_t)=>{
						if(gameinfo==undefined)
						{
							cb('create gameinfo failed');
						}
						else
						{
							cb();
						}
					});	
				});

				//发送游戏开始通知
				funcs.push((cb)=>{
					var uids=[channel.records[src_uid],channel.records[tar_uid]];
					this.channelService.pushMessageByUids(FriendGameStart, {
						code:200,
						data:null
					}, uids, cb);
				});

				
				async.waterfall(funcs,(err,result)=>{
					cb(err);
				});
				

				// game_dic[src_uid].players[tar_uid]={
				// 	uid:tar_uid,
				// 	name:tar_name,
				// 	group_id:2,
				// 	actived_food_ids:tar_actived_food_ids
				// };
				// delete match_dic[src_uid];
			}
			else
			{
				cb("不是邀请的对象");
			}
			
		}
		else
		{
			cb("用户忙");
		}
	}
	else
	{
		cb("用户不在线");
	}
}

//拒绝对战邀请
FriendRemote.prototype.RefuseInviteFight = function(src_uid,tar_uid,cb)
{
	var channel = this.channelService.getChannel(0, false);

	if(!!friends_dic[src_uid]&&!!friends_dic[tar_uid])
	{
		if(friends_dic[src_uid].state==2&&friends_dic[tar_uid].state==2)
		{
			if(match_dic[src_uid]==tar_uid)
			{
				delete match_dic[src_uid];

				this.channelService.pushMessageByUids(RefuseInviteFight,{
					code:200,
					data:{
						// src_uid:src_uid,
						tar_uid:tar_uid
					}
				},[channel.records[src_uid]],cb);

			}
			else
			{
				cb("不是邀请的对象");
			}
			
		}
		else
		{
			cb("用户忙");
		}
	}
	else
	{
		cb("用户不在线");
	}
}

