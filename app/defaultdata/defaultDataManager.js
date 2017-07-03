var pomelo = require('pomelo');
var async=require('async');
var db=pomelo.app.get('db');

var logger = require('pomelo-logger').getLogger(__filename);

var md5=require("../util/md5");
// var utils=require("pomelo-admin/lib/util/utils");


var fs = require('fs');



var d_skill={};
var d_building={};
var d_gametype={};
var d_direction={};
// var d_role_skill={};
// var d_role_direction={};
var d_landform={};
var d_resource={};
var d_meat={};
var d_banana_value={};
var d_single_game_info={};
var d_role_init_property={};
var d_building_init_property={};
// var d_building_direction={};
var d_names={};
var d_cook_skill={};
var d_food={};
var d_story_talk={};
// var d_random_talk={};

exports.init=function(write)
{
	// var fso=new ActiveXObject(Scripting.FileSystemObject);
	if(write==undefined)
	{
		write=false;
	}
	else
	{
		console.log("write defaultdata");
	}
	var datalist={};

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
		sql="select * from skill";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_skill[rows[i].skill_id]=rows[i];
					d_skill[rows[i].skill_id].properties=JSON.parse(d_skill[rows[i].skill_id].properties);
					d_skill[rows[i].skill_id].params=JSON.parse(d_skill[rows[i].skill_id].params);
				}
				if(write)
				{
					var str=JSON.stringify(d_skill);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DSkill.txt',str,(err_fs,data_fs)=>{
						datalist.DSkill=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});
	funcs.push((cb)=>{
		sql="select * from building";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_building[rows[i].building_did]=rows[i];
				}
				if(write)
				{
					var str=JSON.stringify(d_building);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DBuilding.txt',str,(err_fs,data_fs)=>{
						datalist.DBuilding=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});
	funcs.push((cb)=>{
		sql="select * from gametype";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_gametype[rows[i].gametype_id]=rows[i];
					d_gametype[rows[i].gametype_id].playercount_in_group=JSON.parse(d_gametype[rows[i].gametype_id].playercount_in_group);
				}
				if(write)
				{
					var str=JSON.stringify(d_gametype);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DGameType.txt',str,(err_fs,data_fs)=>{
						datalist.DGameType=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});
	funcs.push((cb)=>{
		sql="select * from direction";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					// var direction=rows[i];
					// d_direction[direction.direction_did]={};
					// d_direction[direction.direction_did].direction_did=direction.direction_did;
					// d_direction[direction.direction_did].name=direction.name;
					// d_direction[direction.direction_did].role_did=JSON.parse(direction.role_did);
					// d_direction[direction.direction_did].building_did=JSON.parse(direction.building_did);
					// d_direction[direction.direction_did].building_uid=direction.building_uid;
					// d_direction[direction.direction_did].building_group=direction.building_group;
					// d_direction[direction.direction_did].landform=JSON.parse(direction.landform);
					// d_direction[direction.direction_did].resource=JSON.parse(direction.resource);
					// d_direction[direction.direction_did].hide=direction.hide;
					var direction=rows[i];
					direction.role_did=JSON.parse(direction.role_did);
					direction.building_did=JSON.parse(direction.building_did);
					direction.landform=JSON.parse(direction.landform);
					direction.resource=JSON.parse(direction.resource);
					direction.meat=JSON.parse(direction.meat);
					d_direction[direction.direction_did]=direction;


				}
				if(write)
				{
					var str=JSON.stringify(d_direction);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DDirection.txt',str,(err_fs,data_fs)=>{
						datalist.DDirection=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});
	// funcs.push((cb)=>{
	// 	sql="select * from role_skill";
	// 	connection.query(sql,null,(err,rows)=>{
	// 		if(err)
	// 		{
	// 			cb(err);
	// 		}
	// 		else
	// 		{
	// 			for(i in rows)
	// 			{
	// 				if(d_role_skill[rows[i].role_did]==undefined)
	// 				{
	// 					d_role_skill[rows[i].role_did]=[];
	// 				}
	// 				d_role_skill[rows[i].role_did].push(rows[i].skill_id);
	// 				// d_role_init_skill[rows[i].role_did].skillid_list=JSON.parse(d_roleinitskill[rows[i].role_did].skillid_list);
	// 			}
	// 			if(write)
	// 			{
	// 				var str=JSON.stringify(d_role_skill);
	// 				fs.writeFile('app/defaultdata/alldata/defaultdata/DRoleSkill.txt',str,(err_fs,data_fs)=>{
	// 					datalist.DRoleSkill=md5.md5(str);
	// 					cb(err_fs);
	// 				});
	// 			}
	// 			else
	// 			{
	// 				cb();
	// 			}
				
	// 		}
	// 	});
	// });
	// funcs.push((cb)=>{
	// 	sql="select * from role_direction";
	// 	connection.query(sql,null,(err,rows)=>{
	// 		if(err)
	// 		{
	// 			cb(err);
	// 		}
	// 		else
	// 		{
	// 			for(i in rows)
	// 			{
	// 				if(d_role_direction[rows[i].role_did]==undefined)
	// 				{
	// 					d_role_direction[rows[i].role_did]=[];
	// 				}
	// 				d_role_direction[rows[i].role_did].push(rows[i].direction_did);
	// 			}
	// 			if(write)
	// 			{
	// 				var str=JSON.stringify(d_role_direction);
	// 				fs.writeFile('app/defaultdata/alldata/defaultdata/DRoleDirection.txt',str,(err_fs,data_fs)=>{
	// 					datalist.DRoleDirection=md5.md5(str);
	// 					cb(err_fs);
	// 				});
	// 			}
	// 			else
	// 			{
	// 				cb();
	// 			}
				
	// 		}
	// 	});
	// });
	funcs.push((cb)=>{
		sql="select * from landform";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_landform[rows[i].landform_id]=rows[i];
				}
				if(write)
				{
					var str=JSON.stringify(d_landform);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DLandform.txt',str,(err_fs,data_fs)=>{
						datalist.DLandform=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});
	funcs.push((cb)=>{
		sql="select * from resource";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_resource[rows[i].resource_id]=rows[i];
				}
				if(write)
				{
					var str=JSON.stringify(d_resource);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DResource.txt',str,(err_fs,data_fs)=>{
						datalist.DResource=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});
	funcs.push((cb)=>{
		sql="select * from meat";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_meat[rows[i].meat_id]=rows[i];
				}
				if(write)
				{
					var str=JSON.stringify(d_meat);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DMeat.txt',str,(err_fs,data_fs)=>{
						datalist.DMeat=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});
	funcs.push((cb)=>{
		sql="select * from banana_value";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_banana_value[rows[i].monkey_lv]=rows[i];
				}
				if(write)
				{
					var str=JSON.stringify(d_banana_value);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DBananaValue.txt',str,(err_fs,data_fs)=>{
						datalist.DBananaValue=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});
	funcs.push((cb)=>{
		sql="select * from single_game_info";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_single_game_info[rows[i].progress_id]=rows[i];
					d_single_game_info[rows[i].progress_id].food_ids=JSON.parse(d_single_game_info[rows[i].progress_id].food_ids);
					d_single_game_info[rows[i].progress_id].direction_dids=JSON.parse(d_single_game_info[rows[i].progress_id].direction_dids);
					d_single_game_info[rows[i].progress_id].landform_map=JSON.parse(d_single_game_info[rows[i].progress_id].landform_map);
					d_single_game_info[rows[i].progress_id].resource_map=JSON.parse(d_single_game_info[rows[i].progress_id].resource_map);
					d_single_game_info[rows[i].progress_id].meat_map=JSON.parse(d_single_game_info[rows[i].progress_id].meat_map);
				}
				if(write)
				{
					var str=JSON.stringify(d_single_game_info);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DSingleGameInfo.txt',str,(err_fs,data_fs)=>{
						datalist.DSingleGameInfo=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});
	funcs.push((cb)=>{
		sql="select * from role_init_property";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_role_init_property[rows[i].role_did]=rows[i];
					d_role_init_property[rows[i].role_did].skill_id_list=JSON.parse(d_role_init_property[rows[i].role_did].skill_id_list);
					d_role_init_property[rows[i].role_did].cook_skill_id_list=JSON.parse(d_role_init_property[rows[i].role_did].cook_skill_id_list);
				}
				if(write)
				{
					var str=JSON.stringify(d_role_init_property);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DRoleInitProperty.txt',str,(err_fs,data_fs)=>{
						datalist.DRoleInitProperty=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});

	funcs.push((cb)=>{
		sql="select * from building_init_property";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_building_init_property[rows[i].building_did]=rows[i];
				}
				if(write)
				{
					var str=JSON.stringify(d_building_init_property);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DBuildingInitProperty.txt',str,(err_fs,data_fs)=>{
						datalist.DBuildingInitProperty=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});

	// funcs.push((cb)=>{
	// 	sql="select * from building_direction";
	// 	connection.query(sql,null,(err,rows)=>{
	// 		if(err)
	// 		{
	// 			cb(err);
	// 		}
	// 		else
	// 		{
	// 			for(i in rows)
	// 			{
	// 				d_building_direction[rows[i].direction_did]={};
	// 				d_building_direction[rows[i].direction_did].direction_did=rows[i].direction_did;
	// 				d_building_direction[rows[i].direction_did].name=rows[i].name;
	// 				d_building_direction[rows[i].direction_did].building_did=JSON.parse(rows[i].building_did);
	// 			}
	// 			if(write)
	// 			{
	// 				var str=JSON.stringify(d_building_direction);
	// 				fs.writeFile('app/defaultdata/alldata/defaultdata/DBuildingDirection.txt',str,(err_fs,data_fs)=>{
	// 					datalist.DBuildingDirection=md5.md5(str);
	// 					cb(err_fs);
	// 				});
	// 			}
	// 			else
	// 			{
	// 				cb();
	// 			}
				
	// 		}
	// 	});
	// });

	funcs.push((cb)=>{
		sql="select * from names";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_names[rows[i].name_id]=rows[i].name;
				}
				if(write)
				{
					var str=JSON.stringify(d_names);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DNames.txt',str,(err_fs,data_fs)=>{
						datalist.DNames=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});

	funcs.push((cb)=>{
		sql="select * from cook_skill";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_cook_skill[rows[i].cook_skill_id]=rows[i];
					// d_cook_method[rows[i].cook_method_id].method_need_list=JSON.parse(d_cook_method[rows[i].cook_method_id].method_need_list);
				}
				if(write)
				{
					var str=JSON.stringify(d_cook_skill);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DCookSkill.txt',str,(err_fs,data_fs)=>{
						datalist.DCookSkill=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});

	funcs.push((cb)=>{
		sql="select * from food";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					d_food[rows[i].food_id]=rows[i];
					d_food[rows[i].food_id].cook_skills_need=JSON.parse(d_food[rows[i].food_id].cook_skills_need);
					d_food[rows[i].food_id].inspire_skill_properties=JSON.parse(d_food[rows[i].food_id].inspire_skill_properties);
					d_food[rows[i].food_id].inspire_skill_values=JSON.parse(d_food[rows[i].food_id].inspire_skill_values);
				}
				if(write)
				{
					var str=JSON.stringify(d_food);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DFood.txt',str,(err_fs,data_fs)=>{
						datalist.DFood=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});

	funcs.push((cb)=>{
		sql="select * from story_talk";
		connection.query(sql,null,(err,rows)=>{
			if(err)
			{
				cb(err);
			}
			else
			{
				for(i in rows)
				{
					if(!d_story_talk[rows[i].process_id])
					{
						d_story_talk[rows[i].process_id]=[];
					}
					d_story_talk[rows[i].process_id][rows[i].sub_id]=rows[i].content;
				}
				if(write)
				{
					var str=JSON.stringify(d_story_talk);
					fs.writeFile('app/defaultdata/alldata/defaultdata/DStoryTalk.txt',str,(err_fs,data_fs)=>{
						datalist.DStoryTalk=md5.md5(str);
						cb(err_fs);
					});
				}
				else
				{
					cb();
				}
				
			}
		});
	});





	funcs.push((cb)=>{
		if(write)
		{
			fs.writeFile('app/defaultdata/alldata/DefaultDataList.txt',JSON.stringify(datalist),(err,data)=>{
				cb(err);
			});
		}
		else
		{
			cb();
		}
		
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
				console.log(err);
				logger.info('defaultdata init failed!');
			});
		}
		else
		{
			connection.release();
			logger.info('defaultdata init!');
		}
	});

	return this;
}

// exports.get_d_role=function(role_did)
// {
// 	return d_role[role_did];
// }

exports.get_d_skill=function(skill_id)
{
	return d_skill[skill_id];
}

exports.get_d_building=function(building_did)
{
	return d_building[building_did];
}

exports.get_d_gametype=function(gametype_id)
{
	return d_gametype[gametype_id];
}

exports.get_d_direction=function(direction_did)
{
	return d_direction[direction_did];
}

// exports.get_d_role_skill=function(role_did)
// {
// 	return d_role_skill[role_did];
// }

// exports.get_d_role_direction=function(role_did)
// {
// 	return get_d_role_direction[role_did];
// }

exports.get_d_landform=function(landform_id)
{
	return d_landform[landform_id];
}

exports.get_d_resource=function(resource_id)
{
	return d_resource[resource_id];
}

exports.get_d_meat=function(meat_id)
{
	return d_meat[meat_id];
}

exports.get_d_banana_value=function(monkey_lv)
{
	return d_banana_value[monkey_lv];
}

exports.get_d_single_game_info=function(progress_id)
{
	return d_single_game_info[progress_id];
}
exports.get_d_single_game_info_max_progress=function()
{
	return Object.keys(d_single_game_info).length;
}

exports.get_d_role_init_property=function(role_did)
{
	return d_role_init_property[role_did];
}
exports.get_d_building_init_property=function(building_did)
{
	return d_building_init_property[building_did];
}
// exports.get_d_building_direction=function(direction_did)
// {
// 	return d_building_direction[direction_did];
// }

exports.get_d_names_dic=function()
{
	return d_names;
}

exports.get_d_cook_skill=function(cook_skill_id)
{
	return d_cook_skill[cook_skill_id];
}

// exports.get_d_cook_skills=function()
// {
// 	return d_cook_skill;
// }

exports.get_d_food=function(food_id)
{
	return d_food[food_id];
}





