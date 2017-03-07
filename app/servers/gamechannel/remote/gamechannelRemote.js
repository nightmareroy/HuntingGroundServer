module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var handler = Handler.prototype;


var logger = require('pomelo-logger').getLogger(__filename);

var userChannelDic={};

const DoAction="DoAction";
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

		

		// logger.info(uid);
		// logger.info("enter game channel:");
		// logger.info(creator_id);
	}
	else
	{
		var err="already in the game channel";
		logger.info(err);
		cb(err);
	}

	
	
}

//多人加入游戏频道,session中加入creator_id,并向玩家发送游戏数据
// handler.MultiEnterGameChannelAndSendGameinfo=function(creator_id,sid_dic,gamedic_user,cb)
// {
// 	if(this.channelService.channels[creator_id]!=undefined)
// 	{
// 		cb('the creator_id channel is already exist!');
// 	}
	

// 	var channel = this.channelService.getChannel(creator_id, true);

// 	//玩家们加入频道
// 	for(uid in sid_dic)
// 	{
// 		channel.add(uid, sid_dic[uid]);

// 	}



// 	var funcs=[];

// 	//每个玩家session中写数据
// 	for(uid in sid_dic)
// 	{
// 		(()=>{
// 			var backendSession;
// 			funcs.push((cb)=>{
// 				this.app.backendSessionService.getByUid(channel.records[uid].sid,uid,(err,bs)=>{
// 					backendSession=bs;
// 					cb();
// 				})
		
// 			});

// 			funcs.push((cb)=>{
// 				backendSession.set('creator_id',creator_id);
// 				backendSession.push('creator_id',()=>{
// 					cb();
// 				});
// 			});

// 			funcs.push((cb)=>{
// 				backendSession.set('creator_id',creator_id);
// 				backendSession.push('creator_id',()=>{
// 					cb();
// 				});
// 			});
			
// 		})();
		
// 	}

// 	//推送消息
// 	funcs.push((cb)=>{
// 		var uids=[];
// 		for(uid_t in gamedic.players)
// 		{
// 			uids.push(channel.records[uid_t]);
// 		}
// 		this.channelService.pushMessageByUids(MultiGameStart, {
// 			code:200,
// 			data:null
// 		}, uids, ()=>{
// 			cb();
// 		});
// 	});
	
// 	async.waterfall(funcs,(err,result)=>{
// 		if(err)
// 		{
// 			callback(false);
// 		}
// 		else
// 		{
// 			callback(true);
			
// 		}
// 	});











// 	if(userChannelDic[uid]==undefined)
// 	{
		
		
// 		userChannelDic[uid]=creator_id;

// 		logger.info(uid);
// 		logger.info("enter game channel:");
// 		logger.info(creator_id);
// 	}
// 	else
// 	{
// 		logger.info("already in the game channel");
// 	}

// 	cb();
	
// }


/**
 * Kick user out chat game channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 *
 */
handler.LeaveGameChannel = function(uid,cb)
{
	var creator_id=userChannelDic[uid];
	if(creator_id!=undefined)
	{
		var channel = this.channelService.getChannel(creator_id, true);
		var frontendId=channel.records[uid].sid;
		channel.leave(uid, frontendId);
		delete userChannelDic[uid];

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
		// logger.info(uid);
		// logger.info("leave game channel:");
		// logger.info(creator_id);

		
		
	}
	else
	{
		cb();
	}
	
	
};

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
handler.GameOver = function(creator_id,msg,cb)
{
	var channel = this.channelService.getChannel(creator_id, false);
	// console.log(creator_id);

	channel.pushMessage(GameOver,{
		code:200,
		data:msg
	},()=>{
		//玩家们离开频道
		for(uid_t in channel.records)
		{
			// channel.leave(uid,channel.records[uid].sid);
			delete userChannelDic[uid_t];
		}
		channel.destroy();
		cb();
	});

	
	


	
};

