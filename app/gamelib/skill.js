var pomelo = require('pomelo');
var async=require('async');
var db=pomelo.app.get('db');

var defaultDataManager=require('../defaultdata/defaultDataManager')


//根据roleid获取某个role的初始技能列表
exports.getroleinitskillbyid=function(roleid,callback)
{
	var roleinitskill;
	var roledid;

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
		//get roledid
		sql="select * from game_total_role where roleid=?";
		connection.query(sql,roleid,(err,rows)=>{
			if(rows)
			{
				roledid=rows[0].roledid;
				roleinitskill=defaultDataManager.get_d_roleinitskill(roledid);
			}
			cb(err);
			
		});
	});



	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			connection.release();
			callback(null);
		}
		else
		{
			connection.release();
			callback(roleinitskill);
		}
	});
}



//获取某个role的额外技能列表
exports.getroleaddskill=function(roleid,callback)
{
	var roleaddskill=[];

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
		//get role add skill
		sql="select * from game_total_roleaddskill where roleid=?";
		connection.query(sql,roleid,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					roleaddskill.push(rows[i].skillid);
				}
				cb(err);
			}
			else
			{
				cb(err);
			}
			
		});
	});

	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			connection.release();
			callback(null);
		}
		else
		{
			connection.release();
			callback(roleaddskill);
		}
	});
}


//获取某个role的所有技能列表
exports.getroleskill=function(roleid,callback)
{
	var roleskill=[];

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
		//get roledid
		sql="select * from game_total_role where roleid=?";
		connection.query(sql,roleid,(err,rows)=>{
			if(rows)
			{
				roledid=rows[0].roledid;
				roleinitskill=defaultDataManager.get_d_roleinitskill(roledid);
				for(i in roleinitskill)
				{
					roleskill.push(roleinitskill[i]);
				}
			}
			cb(err);
			
		});
	});


	funcs.push((cb)=>{
		//get role add skill
		sql="select * from game_total_roleaddskill where roleid=?";
		connection.query(sql,roleid,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					roleskill.push(rows[i].skillid);
				}
			}
			cb(err);
			
		});
	});
	funcs.push((cb)=>{
		connection.commit((err)=>{
			cb(err);
		});
	});

	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			connection.release();
			callback(null);
		}
		else
		{
			connection.release();
			callback(roleskill);
		}
	});
}


//某个role增加额外技能
exports.addroleskill=function(roleid,skillid,callback)
{
	var roleaddskill=[];

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
		//get role init skill
		sql="select roleinitskill.skillid from roleinitskill,game_total_role where roleinitskill.roledid = game_total_role.roledid and game_total_role.roleid=?";
		connection.query(sql,roleid,(err,rows)=>{
			if(rows)
			{
				var haveskill=false;
				for(i in rows)
				{
					if(skillid==rows[i].skillid)
					{
						haveskill=true;
						break;
					}
				}
				if(!haveskill)
				{
					cb(err);
				}
				else
				{
					cb("the skill already exist");
				}
			}
			else
			{
				cb(err);
			}
			
		});
	});

	funcs.push((cb)=>{
		var initskill = defaultDataManager.get_d_roleinitskill(roledid);
		var haveskill=false;
		for(i in initskill)
		{
			if(skillid==initskill[i])
			{
				haveskill=true;
				break;
			}
		}
		if(!haveskill)
		{
			cb();
		}
		else
		{
			cb("the skill already exist");
		}

	});


	funcs.push((cb)=>{
		//get role add skill
		sql="select skillid from game_total_roleaddskill where roleid=?";
		connection.query(sql,roleid,(err,rows)=>{
			if(rows)
			{
				var haveskill=false;
				for(i in rows)
				{
					if(skillid==rows[i].skillid)
					{
						haveskill=true;
						break;
					}
				}
				if(!haveskill)
				{
					cb(err);
				}
				else
				{
					cb("the skill already exist");
				}
			}
			else
			{
				cb(err);
			}
			
		});
	});

	funcs.push((cb)=>{
		//insert role add skill
		sql="insert into game_total_roleaddskill(roleid,skillid) values(?,?)";
		connection.query(sql,[roleid,skillid],(err,rows)=>{
			cb(err);
		});
	});
	funcs.push((cb)=>{
		connection.commit((err)=>{
			cb(err);
		});
	});
	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			connection.release();
			callback(false);
		}
		else
		{
			connection.release();
			callback(true);
		}
	});
}

//判断是否含有眺望技能
exports.get_role_farsight=function(roleid,game_total_role)
{
	var skill_list=defaultDataManager.get_d_roleinitskill(game_total_role[roleid].roledid);
	return skill_list.indexOf(6)!=-1?true:false;
}

//判断是否含有侦查技能
exports.get_role_detective=function(roleid,game_total_role)
{
	var skill_list=defaultDataManager.get_d_roleinitskill(game_total_role[roleid].roledid);
	return skill_list.indexOf(8)!=-1?true:false;
}