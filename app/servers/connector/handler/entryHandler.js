module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

var pomelo = require('pomelo');
var db=pomelo.app.get('db');
var logger = require('pomelo-logger').getLogger(__filename);

var md5=require("../../../util/md5");

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;
	var rid = msg.rid;
	var uid = msg.username + '*' + rid
	var sessionService = self.app.get('sessionService');

	//duplicate log in
	if( !! sessionService.getByUid(uid)) {
		next(null, {
			code: 500,
			error: true
		});
		return;
	}

	

	session.bind(uid);
	session.set('rid', rid);
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onUserLeave.bind(null, self.app));

	//put user into channel
	self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
		next(null, {
			users:users
		});
	});
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if(!session || !session.uid) {
		return;
	}
	app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};

handler.login = function(msg, session, next) {
	var self = this;
	var sessionService = self.app.get('sessionService');
	var account=msg['account'];
	var pwd=msg['pwd'];
	pwd=md5.md5(pwd);

	var sql="select * from user where account=?";

	db.query(sql,account,(err, rows,fields)=>{
		if (err)
		{
			next(
				null,
				{
					code:500,
					data:err
				}
			)
			return;
		} 
		else {
			if(rows.length==0)
			{
				next(
					null,
					{
						code:500,
						data:"account dosn't exist!"
					}
				)
				return
			}
			
			var user=rows[0];

			if(pwd!=user.pwd)
			{
				next(
					null,
					{
						code:500,
						data:"the pwd is wrong!"
					}
				)
				return;
			}
			

			//duplicate log in
			if( !! sessionService.getByUid(user.uid)) {
				next(null, {
					code: 500,
					data: "duplicate log in!"
				});
				return;
			}
			session.bind(user.uid);
			session.set('sid', this.app.get('serverId'));
			session.push('sid', function(err) {
				if(err) {
					console.error('set sid for session service failed! error is : %j', err.stack);
				}
			});
			// this.app.rpc.connector.entryRemote.joingame(session, user.uid, self.app.get('serverId'), true);
			session.on('closed', onLeaveGame.bind(null, this.app));
			next(
				null,
				{
					code:200,
					data:{
						uid:user.uid,
						account:user.account,
						// current_game_id:user.current_game_id,
						win_count:user.win_count,
						fail_count:user.fail_count
					}
				}
			)
		}

	});
	
}

var onLeaveGame=function(app,session)
{
	if(!session || !session.uid) {
		return;
	}
	var gameid=session.get('gameid');
	//session.remove('gameid');//需要手动删除吗？
	
	if(gameid!=undefined)
	{
		app.rpc.connector.entryRemote.leavegame(session, session.uid,gameid,null);
	}
	
}

handler.register=function(msg, session, next)
{
	var account=msg['account'];
	var pwd=msg['pwd'];

	if(!AntiSqlValid(account))
	{
		next(
				null,
				{
					code:500,
					data:"account have illegal code!"
				}
			);
		return;
	}
	if(!AntiSqlValid(account))
	{
		next(
				null,
				{
					code:500,
					data:"pwd have illegal code!"
				}
			);
		return;
	}

	pwd=md5.md5(pwd);

	// db.getConnection((err,connection)=>{

	// 	connection.beginTransaction(function (err) {
	// 		var sql="select count(*) from user where account=?";
	// 		connection.query(sql,account,(err, rows,fields)=>{

	// 		});
	// 	});
	// })






	// next(
	// 			null,
	// 			{
	// 				code:500,
	// 				data:pwd
	// 			}
	// 		);
	// return

	var sql="select count(*) from user where account=?";
	db.query(sql,account,(err, rows,fields)=>{
		if (err) {
			next(
				null,
				{
					code:500,
					data:"the account is registered!"
				}
			)
			return;
		} 
		else {
			var param=[account,pwd];
			var sql = "INSERT INTO user (account, pwd)VALUES(?,?)";
			db.query(sql,param,(err,rows, fields)=>{
				if (err) {
					next(
						null,
						{
							code:500,
							data:err
						}
					)
				} 
				else {
					next(
						null,
						{
							code:200,
							data:rows
						}
					)
				}
			});
		}
	});

}


//防止SQL注入
function AntiSqlValid(text)
{
	var re= /select|update|delete|exec|count|’|"|=|;|>|<|%|\s+/i;
	if ( re.test(text) )
	{
		//alert("请您不要在参数中输入特殊字符和SQL关键字！"); //注意中文乱码
		// oField.value = ”;
		// oField.className="errInfo";
		// oField.focus();
		return false;
    }
    return true;
} 

// function stripscript(s)
// {
// 	var pattern = new RegExp("[%--`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")       //格式 RegExp("[在中间定义特殊过滤字符]")
// 	var rs = "";
// 	for (var i = 0; i < s.length; i++) {
// 	rs = rs+s.substr(i, 1).replace(pattern, '');
// 	}
// 	return rs;
// }