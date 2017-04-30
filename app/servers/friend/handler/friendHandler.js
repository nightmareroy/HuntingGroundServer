module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var handler = Handler.prototype;


var pomelo = require('pomelo');
var async=require('async');
var db=pomelo.app.get('db');






handler.GetFriends=function(msg,session,next)
{
	var uid=session.uid;

	var friends={};

	var friends_list;

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
		sql="select u.uid,u.name from user as u, friend as f where f.uid_1=? and f.uid_2=u.uid union all select u.uid,u.name from user as u, friend as f where f.uid_2=? and f.uid_1=u.uid";
		connection.query(sql,[uid,uid],(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					friends[rows[i].uid]={
						uid:rows[i].uid,
						name:rows[i].name
					}

				}
			}
			cb(err);
		});
	});

	funcs.push((cb)=>{
		this.app.rpc.friend.friendRemote.GetStates(session,friends,(param)=>{
			friends_list=param;
			// console.log(friends_list)
			cb();
		})
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
			connection.commit((err_commit)=>{
				connection.release();
				next(
					null,
					{
						code:200,
						data:friends_list
					}
				)
			});
			
		}
	});
}

handler.GetApplications=function(msg,session,next)
{
	var uid=session.uid;

	var applicationers={};

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
		sql="select u.uid,u.name from user as u, friend_apply as f where f.tar_uid=? and f.uid=u.uid";
		connection.query(sql,[uid],(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					applicationers[rows[i].uid]={
						uid:rows[i].uid,
						name:rows[i].name
					};

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
			connection.commit((err_commit)=>{
				connection.release();
				next(
					null,
					{
						code:200,
						data:applicationers
					}
				)
			});
			
		}
	});
}

handler.GetSends=function(msg,session,next)
{
	var uid=session.uid;

	var sends={};

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
		sql="select u.uid,u.name from user as u, friend_apply as f where f.uid=? and f.tar_uid=u.uid";
		connection.query(sql,[uid],(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					sends[rows[i].uid]={
						uid:rows[i].uid,
						name:rows[i].name
					};

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
			connection.commit((err_commit)=>{
				connection.release();
				next(
					null,
					{
						code:200,
						data:sends
					}
				)
			});
			
		}
	});
}

handler.ApplyFriend=function(msg,session,next)
{
	var uid=session.uid;

	var tar_name=msg.tar_name;
	var tar_uid;

	var applicationers=[];


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
		sql="select count(*) from friend_apply where uid=?";
		connection.query(sql,[uid],(err,rows)=>{
			if(rows)
			{
				if(rows[0]['count(*)']>=20)
				{
					cb('发出的申请不能超过20个');
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
		sql="select * from user where name=?";
		connection.query(sql,[tar_name],(err,rows)=>{
			if(rows)
			{
				if(rows.length==0)
				{
					cb('该昵称不存在');
				}
				else
				{
					tar_uid=rows[0].uid;
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
		sql="select * from friend where uid_1=? and uid_2=? union all select * from friend where uid_1=? and uid_2=?";
		connection.query(sql,[uid,tar_uid,tar_uid,uid],(err,rows)=>{
			if(rows)
			{
				if(rows.length>0)
				{
					cb('已经是好友了');
				}
			}
			cb(err);
		});
	});

	funcs.push((cb)=>{
		sql="select * from friend_apply where uid=? and tar_uid=? union all select * from friend_apply where uid=? and tar_uid=?";
		connection.query(sql,[uid,tar_uid,tar_uid,uid],(err,rows)=>{
			if(rows)
			{
				if(rows.length>0)
				{
					cb('已申请');
				}
			}
			cb(err);
		});
	});

	funcs.push((cb)=>{
		sql="insert into friend_apply(uid,tar_uid) values(?,?)";
		connection.query(sql,[uid,tar_uid],(err,rows)=>{
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
						data:err
					}
				)
			});
		}
		else
		{
			connection.commit((err_commit)=>{
				connection.release();
				next(
					null,
					{
						code:200,
						data:"成功发出申请"
					}
				)
			});
			
		}
	});
}

handler.DeleteFriend=function(msg,session,next)
{
	var uid=session.uid;

	var tar_uid=msg.tar_uid;



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
		sql="delete from friend where (uid_1=? and uid_2=?) or (uid_1=? and uid_2=?)";
		connection.query(sql,[uid,tar_uid,tar_uid,uid],(err,rows)=>{
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
			connection.commit((err_commit)=>{
				connection.release();
				next(
					null,
					{
						code:200,
						data:tar_uid
					}
				)
			});
			
		}
	});
}


handler.AgreeApplication=function(msg,session,next)
{
	var uid=session.uid;

	var src_uid=msg.src_uid;



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
		sql="select count(*) from friend where uid_1=? or uid_2=?";
		connection.query(sql,[uid,uid],(err,rows)=>{
			if(rows)
			{
				if(rows[0]['count(*)']>=30)
				{
					cb('好友数量不能超过30个');
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
		sql="delete from friend_apply where uid=? and tar_uid=?";
		connection.query(sql,[src_uid,uid],(err,rows)=>{
			cb(err);
		});
	});

	funcs.push((cb)=>{
		sql="insert into friend(uid_1,uid_2) values (?,?)";
		connection.query(sql,[src_uid,uid],(err,rows)=>{
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
						data:err
					}
				)
			});
		}
		else
		{
			connection.commit((err_commit)=>{
				connection.release();
				next(
					null,
					{
						code:200,
						data:src_uid
					}
				)
			});
			
		}
	});
}

handler.RefuseApplication=function(msg,session,next)
{
	var uid=session.uid;

	var src_uid=msg.src_uid;



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
		sql="delete from friend_apply where uid=? and tar_uid=?";
		connection.query(sql,[src_uid,uid],(err,rows)=>{
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
			connection.commit((err_commit)=>{
				connection.release();
				next(
					null,
					{
						code:200,
						data:src_uid
					}
				)
			});
			
		}
	});
}

handler.CancelApplication=function(msg,session,next)
{
	var uid=session.uid;

	var tar_uid=msg.tar_uid;



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
		sql="delete from friend_apply where uid=? and tar_uid=?";
		connection.query(sql,[uid,tar_uid],(err,rows)=>{
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
			connection.commit((err_commit)=>{
				connection.release();
				next(
					null,
					{
						code:200,
						data:tar_uid
					}
				)
			});
			
		}
	});
}


handler.InviteFight=function(msg,session,next)
{
	var uid=session.uid;

	var tar_uid=msg.tar_uid;


	var funcs=[];

	funcs.push((cb)=>{
		this.app.rpc.friend.friendRemote.InviteFight(session,uid,tar_uid,()=>{
			cb();
		})
	});
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
			);
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

handler.CancelInviteFight=function(msg,session,next)
{
	var uid=session.uid;

	var tar_uid=msg.tar_uid;


	var funcs=[];

	funcs.push((cb)=>{
		this.app.rpc.friend.friendRemote.CancelInviteFight(session,uid,tar_uid,()=>{
			cb();
		})
	});
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
			);
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


handler.AgreeInviteFight=function(msg,session,next)
{
	var uid=session.uid;

	var src_uid=msg.src_uid;




	// var connection;
	// var sql;
	var funcs=[];
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
	funcs.push((cb)=>{
		this.app.rpc.friend.friendRemote.AgreeInviteFight(session,src_uid,uid,()=>{
			cb();
		})
	});




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



handler.RefuseInviteFight=function(msg,session,next)
{
	var uid=session.uid;

	var src_uid=msg.src_uid;




	// var connection;
	// var sql;
	var funcs=[];
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
	funcs.push((cb)=>{
		this.app.rpc.friend.friendRemote.RefuseInviteFight(session,src_uid,uid,()=>{
			cb();
		})
	});




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