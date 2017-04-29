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


var defaultDataManager=pomelo.app.get('defaultDataManager');


var gamelib=require('../../../gamelib/game');
var maplib=require('../../../gamelib/map');
var skilllib=require('../../../gamelib/skill');
var rolelib=require('../../../gamelib/role');





handler.EnterGameHall=function(msg,session,next)
{
	// var sessionService=this.app.get('sessionService');
	// var session=sessionService.getByUid(uid)[0];
	var uid=session.uid;



	this.app.rpc.gamelist.gamelistRemote.onEnterGameHall(session, session.frontendId,uid,(gamedic)=>{
		next(null,{
			code:200,
			data:gamedic
		});
	});

	
}

handler.LeaveGameHall=function(msg,session,next)
{
	var uid=session.uid;

	this.app.rpc.gamelist.gamelistRemote.onLeaveGameHall(session, session.frontendId,uid,()=>{
		next(null,{
			code:200,
			data:true
		});
	});
}

handler.CreateMultiGame=function(msg,session,next)
{
	var gametype_id=msg.gametype_id;


	var	creator_id=session.get('creator_id');
	var gamedata_sid=session.get('gamedata_sid');
	var gamechannel_sid=session.get('gamechannel_sid');

	if(creator_id!=undefined)
	{
		console.log('already in game')
		next(
			null,
			{
				code:500,
				data:false
			}
		)
		return;
	}
	var user_name=session.get('user_name');
	var actived_food_ids=session.get('actived_food_ids');
	this.app.rpc.gamelist.gamelistRemote.onCreateMultiGame(session,session.uid,user_name,user_name+'的游戏',gametype_id,1,actived_food_ids,()=>{
		next(
			null,
			{
				code:200,
				data:true
			}
		)
	});

}

handler.CancelOrLeaveMultiGame=function(msg,session,next)
{
	// var creator_id=msg.creator_id;

	var funcs=[];

	// console.log(session.get('creator_id'));
	

	funcs.push((cb)=>{
		this.app.rpc.gamelist.gamelistRemote.onCancelOrLeaveMultiGame(session,session.uid,(err)=>{
			cb(err);
		});
	});

	// funcs.push((cb)=>{
	// 	session.delete('creator_id');
	// 	session.push('creator_id',(err_push)=>{
	// 		cb(err_push);
	// 	});
		
	// });


	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			console.log(err);
			next(
				null,
				{
					code:500,
					data:false
				}
			)
		}
		else
		{
			next(
				null,
				{
					code:200,
					data:true
				}
			)
		}
	});


}

handler.JoinMultiGame=function(msg,session,next)
{
	var gametype_id=msg.gametype_id;


	var	creator_id=session.get('creator_id');
	var gamedata_sid=session.get('gamedata_sid');
	var gamechannel_sid=session.get('gamechannel_sid');

	if(creator_id!=undefined)
	{
		console.log('already in game')
		next(
			null,
			{
				code:500,
				data:false
			}
		)
		return;
	}
	creator_id=msg.creator_id;
	var user_name=session.get('user_name');
	var actived_food_ids=session.get('actived_food_ids');

	this.app.rpc.gamelist.gamelistRemote.onJoinMultiGame(session,creator_id,session.uid,user_name,actived_food_ids,(err)=>{
		if(err)
		{
			console.log(err);
		}
		else
		{
			next(
				null,
				{
					code:200,
					data:true
				}
			)
		}
			
	});



	// var creator_id=msg.creator_id;
	
	// var user;

	
	// var connection;
	// var sql;
	// var funcs=[];
	// funcs.push((cb)=>{
	// 	db.getConnection((err,conn)=>{
	// 		connection=conn;
	// 		cb(err);
	// 	});
	// });
	// funcs.push((cb)=>{
	// 	connection.beginTransaction((err)=>{
	// 		cb(err);
	// 	});
	// });

	// funcs.push((cb)=>{
	// 	sql="select * from game_total_player where uid=?";
	// 	connection.query(sql,session.uid,(err,rows)=>{
	// 		if(rows)
	// 		{
	// 			if(rows.length>0)
	// 			{
	// 				cb('already in game!')
	// 			}
	// 			else
	// 			{
	// 				cb();
	// 			}
	// 		}
	// 		else
	// 		{
	// 			cb();
	// 		}
			
	// 	});
	// });
	// funcs.push((cb)=>{
	// 	sql="select * from user where uid=?";
	// 	connection.query(sql,session.uid,(err,rows)=>{
	// 		if(rows)
	// 		{
	// 			user=rows[0];
	// 		}
	// 		cb(err);
	// 	});
	// });


	// funcs.push((cb)=>{
	// 	var creator_id = session.get('creator_id');
	// 	if(creator_id==undefined)
	// 	{
	// 		cb();
	// 	}
	// 	else
	// 	{
	// 		cb('already in game');
	// 	}
	// });

	// funcs.push((cb)=>{
	// 	this.app.rpc.gamelist.gamelistRemote.onJoinMultiGame(session,creator_id,session.uid,user.name,cb);

	// });


	// async.waterfall(funcs,(err,result)=>{
	// 	if(err)
	// 	{
	// 		connection.rollback((err_rollback)=>{
	// 			connection.release();
	// 			next(
	// 				null,
	// 				{
	// 					code:500,
	// 					data:false
	// 				}
	// 			)
	// 		});
	// 	}
	// 	else
	// 	{
	// 		connection.commit((err_commit)=>{
	// 			connection.release();
	// 			next(
	// 				null,
	// 				{
	// 					code:200,
	// 					data:true
	// 				}
	// 			)
	// 		});
			
	// 	}
	// });


}







