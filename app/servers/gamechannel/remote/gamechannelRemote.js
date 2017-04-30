module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var handler = Handler.prototype;


var logger = require('pomelo-logger').getLogger(__filename);
var async=require('async');

var userChannelDic={};

const DoAction="DoAction";
const DoSubAction="DoSubAction";
const UpdateDirectionTurn="UpdateDirectionTurn";
const UserEnter="UserEnter";
const UserLeave="UserLeave";
// const PlayerFail="PlayerFail";
const GameOver="GameOver";
/**
 * user join into chat game channel.
 * 
 *
 */
handler.EnterGameChannel=function(uid,creator_id,frontendId,cb)
{

	if(userChannelDic[uid]==undefined)
	{
		var channel = this.channelService.getChannel(creator_id, true);

		channel.pushMessage(UserEnter,{
			code:200,
			data:{
				uid:uid
			}
		},()=>{
			channel.add(uid, frontendId);
			userChannelDic[uid]=creator_id;
			cb();
		});

	}
	else
	{
		var err="already in the game channel";
		logger.info(err);
		cb(err);
	}

	
	
}


handler.LeaveGameChannel = function(uid,callback)
{
	var creator_id=userChannelDic[uid];
	if(creator_id!=undefined)
	{
		var channel = this.channelService.getChannel(creator_id, false);
		var frontendId=channel.records[uid].sid;
		channel.leave(uid, frontendId);
		delete userChannelDic[uid];

		funcs=[];
		funcs.push((cb)=>{
			this.app.backendSessionService.getByUid(channel.records[uid].sid,uid,(err,backendSessions)=>{
				var backendSession=backendSessions[0];
				if(!!backendSessions)
				{
					backendSession.set('creator_id',-1);
					backendSession.set('gamedata_sid',-1);
					backendSession.set('gamechannel_sid',-1);
					backendSession.pushAll(()=>{
						cb();
					});
				}
				else
				{
					cb();
				}
					


			});
		});

		funcs.push((cb)=>{
			var left_members=channel.getMembers();
			if(left_members.length==0)
			{
				channel.destroy();
				cb();
			}
			else
			{
				channel.pushMessage(UserLeave,{
					code:200,
					data:{
						uid:uid
					}
				},()=>{
					cb();
				});
			}
		});
		
		async.waterfall(funcs,(err,result)=>{
			callback(err);
		});


		
		
	}
	else
	{
		callback();
	}
	
	
};



// handler.CreateGameChannel=function(gameinfo,cb)
// {
// 	var channel = this.channelService.getChannel(gameinfo.game.creator_id, true);
// 	for(uid in gameinfo.players)
// 	{
// 		channel.add(uid, gameinfo.players[uid].frontendId);
// 	}

// 	cb();


	
	
// }







handler.BroadcastActions = function(creator_id,action_list_dic,cb)
{
	var channel = this.channelService.getChannel(creator_id, false);

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

handler.BroadcastDirectionTurn = function(creator_id,uid,cb)
{
	var channel = this.channelService.getChannel(creator_id, false);

	channel.pushMessage(UpdateDirectionTurn,{
		code:200,
		data:{
			uid:uid,
			// direction_turn:direction_turn
		}
	},()=>{
		cb();
	})

	
};

handler.BroadcastSubActions = function(creator_id,action_dic,cb)
{
	var channel = this.channelService.getChannel(creator_id, false);

	for(uid in action_dic)
	{
		if(channel.records[uid]!=undefined)
		{
			this.channelService.pushMessageByUids(DoSubAction, {
				code:200,
				data:action_dic[uid]
			}, [channel.records[uid]], ()=>{});
		}
		
	}

	cb();
	
};

//玩家失败
// handler.PlayerFail = function(uid,cb)
// {
// 	var creator_id=userChannelDic[uid];
// 	var channel = this.channelService.getChannel(creator_id, false);
// 	// console.log(creator_id);

// 	//玩家离开频道
// 	channel.leave(uid,channel.records[uid].sid);
// 	delete userChannelDic[uid];


// 	channel.pushMessage(PlayerFail,{
// 		code:200,
// 		data:{
// 			uid:uid
// 		}
// 	},()=>{
// 		cb();
// 	});
// };

//游戏结束
handler.GameOver = function(creator_id,msg,callback)
{
	var channel = this.channelService.getChannel(creator_id, false);
	// console.log(this.channelService.channels);
	// console.log(channel);
	// console.log(creator_id);

	var funcs=[];

	funcs.push((cb)=>{
		channel.pushMessage(GameOver,{
			code:200,
			data:msg
		},()=>{
			cb();
		});
	});

	// funcs.push((cb)=>{
	// 	//删除频道
	// 	channel.destroy();
	// 	cb();
	// });

	funcs.push((cb)=>{
		var sub_funcs=[];

		for(uid_t in channel.records)
		{
			
			(()=>{
				var uid_tt=uid_t;
				sub_funcs.push((sub_cb)=>{

					this.app.backendSessionService.getByUid(channel.records[uid_tt].sid,uid_tt,(err,backendSessions)=>{

						if(!!backendSessions)
						{
							var backendSession=backendSessions[0];
							//删除路由
							backendSession.set('creator_id',-1);
							backendSession.set('gamedata_sid',-1);
							backendSession.set('gamechannel_sid',-1);
							backendSession.pushAll(()=>{
								sub_cb(err);
							});

						}
						else
						{
							sub_cb(err);
						}
							


					});
						
				});
				sub_funcs.push((sub_cb)=>{
					//离开频道

					delete userChannelDic[uid_tt];
					sub_cb();
				});
			})()
				


			
		}
		async.waterfall(sub_funcs,(err,result)=>{
			//删除频道
			channel.destroy();
			cb(err);
		})
		
	});

	async.waterfall(funcs,(err,result)=>{
		callback(err);
	})

	
	


	
};

