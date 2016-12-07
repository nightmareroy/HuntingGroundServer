var pomelo = require('pomelo');
var async=require('async');
var db=pomelo.app.get('db');

var logger = require('pomelo-logger').getLogger(__filename);



var d_role={};
var d_skill={};
var d_mapsize={};
var d_gametype={};
var d_direction={};
var d_roleinitskill={};

exports.init=function()
{
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
		sql="select * from role";
		connection.query(sql,null,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					d_role[rows[i].roledid]=rows[i];
				}
				
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from skill";
		connection.query(sql,null,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					d_skill[rows[i].skillid]=rows[i];
				}
				
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from mapsize";
		connection.query(sql,null,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					d_mapsize[rows[i].mapsizeid]=rows[i];
				}
				console.log(d_mapsize)
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from gametype";
		connection.query(sql,null,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					d_gametype[rows[i].gametype]=rows[i];
				}
				
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from direction";
		connection.query(sql,null,(err,rows)=>{
			if(rows)
			{
				for(i in rows)
				{
					d_direction[rows[i].directionid]=rows[i];
				}
				
			}
			cb(err);
		});
	});
	funcs.push((cb)=>{
		sql="select * from roleinitskill";
		connection.query(sql,null,(err,rows)=>{
			if(rows)
			{
				for(roledid in rows)
				{
					d_roleinitskill[roledid]=JSON.parse(rows[roledid].skillid_list);
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
			connection.rollback((err_rollback)=>{
				connection.release();
				logger.info('defaultdata init failed!');
			});
		}
		else
		{
			connection.release();
			logger.info('defaultdata init!');
		}
	});
}

exports.get_d_role=function(roledid)
{
	return d_role[roledid];
}

exports.get_d_skill=function(skillid)
{
	return d_skill[skillid];
}

exports.get_d_mapsize=function(mapsizeid)
{
	return d_mapsize[mapsizeid];
}

exports.get_d_gametype=function(gametype)
{
	return d_gametype[gametype];
}

exports.get_d_direction=function(directionid)
{
	return d_direction[directionid];
}

exports.get_d_roleinitskill=function(roledid)
{
	return d_roleinitskill[roledid];
}
