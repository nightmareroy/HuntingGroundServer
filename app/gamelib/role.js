var pomelo = require('pomelo');
var async=require('async');
var db=pomelo.app.get('db');

var skilllib=require('./skill');
var maplib=require('./map');
var defaultDataManager=require('../defaultdata/defaultDataManager');


exports.addRole=function(uid,roledid,pos_id,callback)
{
	var roleid;
	var havedetectskill;
	var sightzoon;
	var mapsizeid;
	var width;
	var height;
	var landform_map;
	var detective_map;

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


	//判断该位置是否已存在role
	funcs.push((cb)=>{
		sql="select count(*) from game_total_player as p1,game_total_player as p2,game_total_role as r where r.pos_id=? and r.uid = p1.uid and p1.gameid=p2.gameid and p2.uid=?";
		connection.query(sql,[pos_x,pos_y,uid],(err,rows)=>{
			if(rows)
			{
				if(rows[0]['count(*)']>0)
				{
					cb("a role already exist at that pos!");
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

	//插入role
	funcs.push((cb)=>{
		sql="insert into game_total_role(roledid,uid,pos_id) values(?,?,?)";
		connection.query(sql,[roledid,uid,pos_id],(err,rows)=>{
			if(rows)
			{
				roleid=rows.insertId;
			}
			cb(err);
		});
	});

	//判断是否含有侦查技能
	funcs.push((cb)=>{
		skilllib.getroleinitskillbydid(roledid,(result)=>{
			if(result)
			{
				if(result.indexOf(5)!=-1)
				{
					havedetectskill=true
					
				}
				else
				{
					havedetectskill=false
				}
				cb(null);
			}
			else
			{
				cb('failed');
			}
			
		})
	});

	//获取 total map 信息
	funcs.push((cb)=>{
		sql="select m.landform_map,m.mapsizeid from game_total_map as m,game_total_player as p where p.gameid=m.gameid and p.uid=?";
		connection.query(sql,[uid],(err,rows)=>{
			if(rows)
			{
				landform_map=JSON.parse(rows[0]['landform_map']);
				mapsizeid=rows[0]['mapsizeid'];
			}
			cb(err);
		});
	});

	//获取 mapsize 信息
	funcs.push((cb)=>{
		sql="select * from mapsize where mapsizeid=?";
		connection.query(sql,[mapsizeid],(err,rows)=>{
			if(rows)
			{
				width=rows[0]['width'];
				height=rows[0]['height'];

			}
			cb(err);
		});
	});

	//获取该role的视野范围
	funcs.push((cb)=>{
		sightzoon=maplib.getsightzoon(maplib.getid(width,pos_x,pos_y),havedetectskill,landform_map,width,height)
		cb(null);
	});

	//获取user map
	funcs.push((cb)=>{
		sql="select detective_map from game_user_map where uid = ?";
		connection.query(sql,[uid],(err,rows)=>{
			if(rows)
			{
				detective_map=JSON.parse(rows[0]['detective_map']);
			}
			cb(err);
		});
	});

	//更新user map
	funcs.push((cb)=>{
		for(i in sightzoon)
		{
			detective_map[sightzoon[i]]=1;
		}
		sql="update game_user_map set detective_map = ?";
		connection.query(sql,[JSON.stringify(detective_map)],(err,rows)=>{
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
			console.log(err)
			connection.rollback((err_rollback)=>{
				connection.release();
				callback(false);
			});
		}
		else
		{
			connection.release();
			callback(true);
		}
	});
}

exports.get_role_detail_property=function(roleid,callback)
{
	var role_property;
	var role_base_property;

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
		sql="select * from game_total_role where roleid=?";
		connection.query(sql,[roleid],(err,rows)=>{
			if(rows)
			{
				role_property=rows[0];
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		role_base_property=defaultDataManager.get_d_role(role_property.roleid);
	});
	funcs.push((cb)=>{
		connection.commit((err)=>{
			cb(err);
		});
	});


	async.waterfall(funcs,(err,result)=>{
		if(err)
		{
			connection.rollback((err_rollback)=>{
				connection.release();
				callback(null)
			});
		}
		else
		{
			connection.release();
			callback({
				base_strenth:role_base_property.base_strenth,
				added_strenth:role_property.added_strenth
			})
		}
	});
}

//目前只有执行攻击指令的role才会移动，会移动才需要计算速度等级，所以这里只是执行攻击指令的角色才会调用此函数，所以需要pos_id
exports.get_role_speed_lv=function(role,landform_map,pos_id)
{
	var d_role=defaultDataManager.get_d_role(role.roledid);
	var speed_lv=d_role.base_speed_lv;
	if(role.retreating)
	{
		speed_lv--;
	}
	if(speed_lv<0)
	{
		speed_lv=0;
	}

	//会爬山的role速度等级都设为1
	if(landform_map[pos_id]==2)
	{
		speed_lv==1;
	}
	return speed_lv;
}

exports.get_role_fight_state=function(center_roleid,game_total_role,game_total_player,width,height)
{
	var is_fighting=false;
	var neibourids=maplib.getneibourids(width,height,game_total_role[center_roleid].pos_id);
	for(roleid in game_total_role)
	{
		var role=game_total_role[roleid];
		for(pos_id in neibourids)
		{
			if(role.pos_id==pos_id)
			{
				if(game_total_player[role.uid].groupid!=game_total_player[game_total_role[center_roleid].uid].groupid)
				{
					is_fighting=true;
					break;
				}
				
			}
		}
		if(is_fighting)
		{
			break;
		}

	}
	return is_fighting;
}