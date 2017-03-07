var pomelo = require('pomelo');
var async=require('async');
var db=pomelo.app.get('db');

var logger = require('pomelo-logger').getLogger(__filename);
var defaultDataManager=require('../defaultdata/defaultDataManager');

var uuid=require('uuid');

var actionlib=require("./action");
var maplib=require("./map");
var rolelib=require("./role");
var skilllib=require("./skill");


//在根据剩余move值排序之前，需要给该变量赋值
var gameinfo_sort;

exports.isingame=function(uid,callback)
{
	
}





//action type:
//0:移动
//1:受到伤害
//2:获得状态：(0.撤退)
exports.executedirection=function(gameinfo)
{
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);

	var width=gametype.width;
	var height=gametype.height;
	var action_list_dic={};
	for(uid in gameinfo.players)
	{
		action_list_dic[uid]=[];
	}
	var step=-1;


	var move_roles=[];
	// var temp_role_list;
	var role;
	var next_pos;
	while(step<8)
	{
		step++;
		// action_list[step]={};
		for(uid in gameinfo.players)
		{
			action_list_dic[uid][step]={};
		}
		// console.log('action_list:');
		// console.log(action_list);
		if(step==0)
		{
			//执行回合间隙的操作

			
			for(uid in gameinfo.players)
			{
				//第一回合开始时的role字典
				var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo)//game_total_role,game_total_map,gametype);
				action_list_dic[uid][step].pos={};
				for(i in insight_roles)
				{
					var role=gameinfo.roles[insight_roles[i]];
					action_list_dic[uid][step].pos[role.role_id]=role.pos_id;
				}

				//新增、删除role字典，占位用
				action_list_dic[uid][step].add_roles={};
				action_list_dic[uid][step].delete_roles=[];

				//地图变化字典
				action_list_dic[uid][step].landform_map={};
				action_list_dic[uid][step].resource_map={};
				var sightzoon=maplib.getsightzoon_of_player(uid,gameinfo);
				for(id in sightzoon)
				{
					var zoon_id=sightzoon[id];
					action_list_dic[uid][step].landform_map[zoon_id]=gameinfo.map.landform[zoon_id];
					action_list_dic[uid][step].resource_map[zoon_id]=gameinfo.map.resource[zoon_id];
				}

				//新增、删除building字典，占位用
				action_list_dic[uid][step].add_buildings={};
				action_list_dic[uid][step].delete_buildings=[];


			}

			

			continue;
		}
		else if(step==1||step==2)//||step==3||step==4)
		{
			//创建位置变化字典
			for(uid in gameinfo.players)
			{
				action_list_dic[uid][step].pos={};
			}

			//只有执行移动指令(direction_did==1)的role才会在这几个回合里行动
			

			//在所有移动回合开始前，初始化move变量，最后要删掉
			if(step==1)
			{
				for(role_id in gameinfo.roles)
				{
					role=gameinfo.roles[role_id];
					if(role.direction_did==1)
					{
						var role_all_property=rolelib.get_role_all_property(role.role_id,gameinfo);
						role.move=role_all_property.max_move;
						move_roles.push(role_id);
					}
				}
			}

			// for(role_id in gameinfo.roles)
			// {
			// 	role=gameinfo.roles[role_id];
			// 	if(role.move!=undefined)
			// 	{
			// 		move_roles.push(role_id);
			// 	}
			// }

			gameinfo_sort=gameinfo;
			move_roles.sort(sort_role);
			// console.log(move_roles.length)

			for(i in move_roles)
			{
				var role_id=move_roles[i];
				var role=gameinfo.roles[role_id];

				// console.log(role.move)

				//不在战斗中
				var enemies=maplib.get_enemies(role.role_id,gameinfo)
				if(Object.keys(enemies).length==0)
				{
					if(role.direction_param.length>0)
					{
						next_pos=role.direction_param[0];
						if(maplib.get_pos_movable(next_pos,gameinfo))
						{
							//执行移动
							next_pos=role.direction_param.shift();
							maplib.do_role_move(role.role_id,role.pos_id,next_pos,gameinfo);
						}
					}
					
					
				}
			}
			// console.log("turn")
			// for(role_id in gameinfo.roles)
			// {
			// 	role=gameinfo.roles[role_id];
			// 	if(role.direction_did==1&&role.direction_param.length>0)
			// 	{
			// 		var role_all_property=rolelib.get_role_all_property(role.role_id,gameinfo);
					
			// 		switch(role_all_property.current_speed_lv)
			// 		{
			// 			case 0:
			// 				if(step==1)
			// 				{
			// 					move_roles[role_all_property.current_speed_lv].push(role);
			// 				}
			// 				break;
			// 			case 1:
			// 				if(step==1||step==2)
			// 				{
			// 					move_roles[role_all_property.current_speed_lv].push(role);
			// 				}
			// 				break;
			// 		}

			// 	}

				
			// }

			// for(i in move_roles)
			// {
			// 	var j=move_roles.length-i-1;
			// 	//乱序排列
			// 	move_roles[j].sort(get_random);


			// 	while(move_roles[j].length>0)
			// 	{
					
			// 		role=move_roles[j].shift();
			// 		//不在战斗中
			// 		var enemies=maplib.get_enemies(role.role_id,gameinfo)
			// 		if(Object.keys(enemies).length==0)
			// 		{
			// 			next_pos=role.direction_param[0];
			// 			if(maplib.get_pos_movable(next_pos,gameinfo))
			// 			{
			// 				//执行移动
			// 				next_pos=role.direction_param.shift();
			// 				maplib.do_role_move(role.role_id,next_pos,gameinfo);
			// 			}
						
			// 		}

			// 	}
			// }




////////////////////////////////////////////////////

			

			
			// for(uid in gameinfo.players)
			// {
			// 	//role变化字典
			// 	var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);
			// 	for(i in insight_roles)
			// 	{
			// 		var role=gameinfo.roles[insight_roles[i]];
			// 		action_list_dic[uid][step].pos[role.role_id]=role.pos_id;
			// 	}

			// 	//新增role字典
			// 	var add_roles={};
			// 	for(role_id in action_list_dic[uid][step].pos)
			// 	{
			// 		var role=gameinfo.roles[role_id];
			// 		add_roles[role.role_id]=role;
			// 	}
			// 	//删除role字典  列表
			// 	var delete_roles={};
			// 	var delete_roles_list=[];
			// 	for(role_id in action_list_dic[uid][step-1].pos)
			// 	{
			// 		var role=gameinfo.roles[role_id];
			// 		delete_roles[role.role_id]=role;
			// 	}
			// 	for(role_id in add_roles)
			// 	{
			// 		if(delete_roles[role_id]!=undefined)
			// 		{
			// 			delete add_roles[role_id];
			// 			delete delete_roles[role_id];
			// 		}
			// 	}
			// 	action_list_dic[uid][step].add_roles=add_roles;
			// 	for(role_id in delete_roles)
			// 	{
			// 		var role_id_i=parseInt(role_id);
			// 		delete_roles_list.push(role_id_i);
			// 	}
			// 	action_list_dic[uid][step].delete_roles=delete_roles_list;



			// 	//地图变化字典
			// 	action_list_dic[uid][step].landform_map={};
			// 	action_list_dic[uid][step].resource_map={};
			// 	var sightzoon=maplib.getsightzoon_of_player(uid,gameinfo);
			// 	for(id in sightzoon)
			// 	{
			// 		var zoon_id=sightzoon[id];
			// 		// action_list_dic[uid][step].landform_map[zoon_id]=gameinfo.map.landform[zoon_id]*gameinfo.players[uid].map[zoon_id];
			// 		// action_list_dic[uid][step].resource_map[zoon_id]=gameinfo.map.resource[zoon_id]*gameinfo.players[uid].map[zoon_id];
			// 		action_list_dic[uid][step].landform_map[zoon_id]=gameinfo.map.landform[zoon_id];
			// 		action_list_dic[uid][step].resource_map[zoon_id]=gameinfo.map.resource[zoon_id];

			// 		gameinfo.players[uid].map.landform[zoon_id]=gameinfo.map.landform[zoon_id];
			// 		gameinfo.players[uid].map.resource[zoon_id]=gameinfo.map.resource[zoon_id];
			// 	}

			// 	//building变化字典
			// 	action_list_dic[uid][step].buildings=maplib.get_buildings_modefied_of_player(uid,gameinfo);
			// }
			var modefied_dic=gen_modefied_dic(gameinfo,action_list_dic[uid][step-1]);
			for(uid in gameinfo.players)
			{
				action_list_dic[uid][step]=modefied_dic[uid];
			}



			if(step==2)
			{
				for(i in move_roles)
				{
					var role_id=move_roles[i];
					var role=gameinfo.roles[role_id];
					delete role.move;
				}
			}

			
		}
		else if(step==3)
		{
			//执行攻击
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				var enemies=maplib.get_enemies(role_id,gameinfo);
				
				//新添加两个临时变量，攻击回合结束时要删除
				// role.enemy_count= Object.keys(enemies).length;
				role.enemies=enemies;
				role.all_damage=0;
				
			}
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				var role_all_property=rolelib.get_role_all_property(role.role_id,gameinfo);
				// var enemies=maplib.get_enemies(role_id,gameinfo);
				
				for(enemy_role_id in role.enemies)
				{
					var enemy=role.enemies[enemy_role_id];
					var enemy_all_property=rolelib.get_role_all_property(enemy.role_id,gameinfo);
					role.all_damage+=(enemy_all_property.muscle*enemy_all_property.health)/role_all_property.weight/Object.keys(enemy.enemies).length;
				}
				// role.blood_sugar*=1-role.all_damage;
				// console.log(gameinfo.roles);
				role.all_damage_int=Math.round(role.blood_sugar*role.all_damage);

				if(role.all_damage_int>role.blood_sugar)
				{
					role.all_damage_int=role.blood_sugar;
				}

				role.blood_sugar=role.blood_sugar-role.all_damage_int;

				// console.log(gameinfo.roles);
				delete role.all_damage;
				delete role.enemies;
			}
			

			//写入发送数据
			for(uid in gameinfo.players)
			{
				action_list_dic[uid][step].damage={};
				var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);
				for(i in insight_roles)
				{
					var role=gameinfo.roles[insight_roles[i]];
					if(role.all_damage>0)
					{
						action_list_dic[uid][step].damage[role.role_id]=role.all_damage_int;
						
					}
					
				}
			}

			
			

			
			
			continue;
		}

		//删除blood_sugar为0的角色
		else if(step==4)
		{
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				if(role.blood_sugar==0)
				{
					delete gameinfo.roles[role_id];
				}

			}

			//删除临时数据
			// for(role_id in gameinfo.roles)
			// {
			// 	var role=gameinfo.roles[role_id];				
			// 	delete role.all_damage_int;
			// }


			var modefied_dic=gen_modefied_dic(gameinfo,action_list_dic[uid][2]);
			for(uid in gameinfo.players)
			{
				action_list_dic[uid][step]=modefied_dic[uid];
			}

		}




		else if(step==5)
		{
			//执行撤退


			//向撤退的role中添加最优撤退点及次优撤退点
			var retreating_roles={};
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				var role_all_property=rolelib.get_role_all_property(role_id,gameinfo);
				if(1-role_all_property.health>role_all_property.courage)
				{
					retreating_roles[role_id]=role;
					//添加量个临时变量
					role.first_p=[];
					role.secend_p=[];

					//添加一个临时变量
					role.moved=true;

					var enemies=maplib.get_enemies(role.role_id,gameinfo)
					maplib.fill_retreat_spot(role.role_id,enemies,gameinfo);
				}
				else
				{
					role.moved=false;
				}
			}
			// console.log('gameinfo.roles')
			// console.log(gameinfo.roles)
			// console.log('retreating_roles')
			// console.log(retreating_roles)
			for(role_id in retreating_roles)
			{
				var role=retreating_roles[role_id];
				for(i in role.first_p)
				{
					var pos_id=role.first_p[i];
					if(maplib.get_pos_movable(pos_id,gameinfo))
					{
						maplib.do_role_move(role_id,pos_id,gameinfo);
						delete role.first_p;
						delete role.secend_p;
						delete retreating_roles[role_id];
						break;
					}
				}
			}
			// console.log('gameinfo.roles')
			// console.log(gameinfo.roles)
			// console.log('retreating_roles')
			// console.log(retreating_roles)
			for(role_id in retreating_roles)
			{
				var role=retreating_roles[role_id];
				for(i in role.secend_p)
				{
					var pos_id=role.first_p[i];
					if(maplib.get_pos_movable(pos_id,gameinfo))
					{
						maplib.do_role_move(role_id,pos_id,gameinfo);
						delete role.first_p;
						delete role.secend_p;
						delete retreating_roles[role_id];
						break;
					}
				}
			}

			for(role_id in retreating_roles)
			{
				var role=retreating_roles[role_id];
				delete role.first_p;
				delete role.secend_p;
				delete retreating_roles[role_id];
			}

			var modefied_dic=gen_modefied_dic(gameinfo,action_list_dic[uid][4]);
			for(uid in gameinfo.players)
			{
				action_list_dic[uid][step]=modefied_dic[uid];
			}

			continue;
		}
		else if(step==6)
		{
			//回血
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				var role_all_property=rolelib.get_role_all_property(role_id,gameinfo);
				// action_list_dic[uid][step]
				var blood_sugar_reduced=role_all_property.blood_sugar_max-role_all_property.blood_sugar;
				// console.log(blood_sugar_reduced)
				var recovery=Math.min(blood_sugar_reduced,role_all_property.breath*role.fat/role_all_property.weight);
				// console.log(recovery)
				recovery=Math.min(recovery,role.fat);
				// console.log(recovery)
				recovery=Math.floor(recovery);
				role.blood_sugar+=recovery;
				role.fat-=recovery;

				//写入临时数据
				role.recovery=recovery;

			}

			//写入发送数据
			for(uid in gameinfo.players)
			{
				action_list_dic[uid][step].recovery={};
				var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);
				for(i in insight_roles)
				{
					var role=gameinfo.roles[insight_roles[i]];
					if(role.recovery>0)
					{
						action_list_dic[uid][step].recovery[role.role_id]=role.recovery;
					}
					
				}
			}
			continue;
		}

		//改变地形、资源，建造建筑，进食
		//特殊指令分两步进行，先执行造成视野变化的部分，再执行不造成视野变化的部分
		//视野变化部分
		else if(step==7)
		{

			for(role_id in gameinfo.roles)
			{
				// console.log(role.moved);
				var role=gameinfo.roles[role_id];
				var role_all_property=rolelib.get_role_all_property(role.role_id,gameinfo);
				if(!(role.moved==true&&role.all_damage_int>0))
				{
					//所有技能执行失败的时候，指令id都转换成2（待机）
					switch(role.direction_did)
					{


						//招募采集猴
						case 5:
							if(gameinfo.players[role.uid].banana>=defaultDataManager.get_d_building(3).cost)
							{
								exports.create_building(gameinfo,role.uid,3,role.pos_id);
								// gameinfo.players[role.uid].banana-defaultDataManager.get_d_building(3).cost;
								

							}
							else
							{
								role.direction_did=12;
							}
							
							break;

						//驱赶猴子
						case 6:
							for(building_id in gameinfo.buildings)
							{
								if(gameinfo.buildings[building_id].pos_id==role.pos_id)
								{
									delete gameinfo.buildings[building_id];
									break;
								}
							}

							break;


						//搭窝
						case 9:
							if(gameinfo.players[role.uid].banana>=defaultDataManager.get_d_building(1).cost)
							{
								exports.create_building(gameinfo,role.uid,1,role.pos_id);
								// gameinfo.players[role.uid].banana-defaultDataManager.get_d_building(1).cost;

							}
							else
							{
								role.direction_did=12;
							}
							break;
						//遣散
						case 10:

							delete gameinfo.roles[role.role_id];

							break;
						//哺育
						case 11:
							var neibour_ids=maplib.get_neibour_ids(gameinfo,role.pos_id);
							var new_ids=[];
							for(i in neibour_ids)
							{
								var neibour_pos_id=neibour_ids[i];
								var in_that_pos=false;
								for(role_id in gameinfo.roles)
								{
									var role=gameinfo.roles[role_id];
									if(role.pos_id==neibour_pos_id)
									{
										in_that_pos=true;
										break;
									}
								}
								if(!in_that_pos)
								{
									new_ids.push(neibour_pos_id);
								}
							}
							if(new_ids.length>0)
							{
								var random_id=Math.floor(Math.random()*new_ids.length);
								var selected_pos_id=new_ids[random_id];
								exports.create_role(gameinfo,role.uid,2,selected_pos_id);
							}
							

							break;

					}
				}
				
			}






			var modefied_dic=gen_modefied_dic(gameinfo,action_list_dic[uid][5]);
			// console.log(modefied_dic)
			for(uid in gameinfo.players)
			{
				action_list_dic[uid][step]=modefied_dic[uid];
			}



			// //删除移动标记
			// for(role_id in gameinfo.roles)
			// {
			// 	var role=gameinfo.roles[role_id];
			// 	if(role.moved!=undefined)
			// 	{
			// 		delete role.moved;
			// 	}
				
			// }


		}


		//不造成角色、建筑、视野变化的指令
		else if(step==8)
		{
			
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				var role_all_property=rolelib.get_role_all_property(role.role_id,gameinfo);
				if(!(role.moved==true&&role.all_damage_int>0))
				{
					
					switch(role.direction_did)
					{
						//采集
						case 3:
							//把香蕉变成香蕉树
							gameinfo.map.resource[role.pos_id]=2;
							gameinfo.players[role.uid].banana+=role_all_property.muscle;
							role.action={
								direction_did:role.direction_did,
								param:{
									cost:role.muscle
								}
							}

							break;

						//招募采集猴
						case 5:
							gameinfo.players[role.uid].banana-defaultDataManager.get_d_building(3).cost;
							role.action={
								direction_did:role.direction_did,
								param:{
									cost:defaultDataManager.get_d_building(3).cost
								}
							}
							
							break;
						

						//升级
						case 7:
							var building_id_t;
							for(building_id in gameinfo.buildings)
							{
								if(gameinfo.buildings[building_id].pos_id==role.pos_id)
								{
									building_id_t=building_id;
									gameinfo.buildings[building_id].level++;
									break;
								}
							}
							role.action={
								direction_did:role.direction_did,
								param:{
									cost:building_id_t
								}
							}
							break;
						//进食
						case 8:
							role.action={
								direction_did:role.direction_did,
								param:{

								}
							}
							break;

						//搭窝
						case 9:
							gameinfo.players[role.uid].banana-defaultDataManager.get_d_building(1).cost;
							role.action={
								direction_did:role.direction_did,
								param:{
									cost:defaultDataManager.get_d_building(1).cost
								}
							}
							break;
						
						//抢夺
						case 11:

							break;
					}
				}
				// delete role.moved;
			}


			//写入发送数据
			for(uid in gameinfo.players)
			{
				action_list_dic[uid][step].action={};
				var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);
				for(i in insight_roles)
				{
					var role=gameinfo.roles[insight_roles[i]];
					if(role.action!=undefined)
					{
						action_list_dic[uid][step].action[role.role_id]=role.action;
						delete role.action;
					}
				}
			}

			//删除临时变量
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				if(role.moved!=undefined)
				{
					delete role.moved;
				}
				if(role.action!=undefined)
				{
					delete role.action;
				}
				if(role.all_damage_int!=undefined)
				{
					delete role.all_damage_int;
				}
				
			}



			continue;
		}

		

		
		
	}

	//设定默认指令
	for(role_id in gameinfo.roles)
	{
		var role=gameinfo.roles[role_id];
		role.direction_did=2;
		role.direction_param=[];
	}
	for(building_id in gameinfo.buildings)
	{
		var building=gameinfo.buildings[building_id];
		building.direction_did=0;
	}


	return action_list_dic;
}

exports.check_direction_reasonable=function(uid,direction,gameinfo)
{
	for(role_id in direction)
	{
		var role_direction=direction[role_id];

	}
	return true;
}

//all_roles_dic为本局游戏中的全部role的字典
var check_pos_movable=function(gameinfo,pos_id)
{
	var movable=true;
	for(role_id in gameinfo.roles)
	{
		if(gameinfo.roles[role_id].pos_id==pos_id)
		{
			movable=false;
			break;
		}
	}
	return movable;
}

var check_pos_buildingcreatable=function(gameinfo,pos_id)
{
	var movable=true;
	for(building_id in gameinfo.buildings)
	{
		if(gameinfo.buildings[building_id].pos_id==pos_id)
		{
			movable=false;
			break;
		}
	}
	return movable;
}

//随机排序函数
var get_random=function(a,b)
{
	return Math.random()>0.5 ? -1 : 1; 
}

//根据剩余move排序
var sort_role=function(role_id_a,role_id_b)
{
	return gameinfo_sort.roles[role_id_b].move-gameinfo_sort.roles[role_id_a].move;

}

//添加role
exports.create_role=function(gameinfo,uid,role_did,pos_id)
{
	if(check_pos_movable(gameinfo,pos_id)==false)
	{
		console.log('can not create');
		return;
	}
	
	var name;
	if(gameinfo.names_left.length>0)
	{
		var names_dic=defaultDataManager.get_d_names_dic();
		name=names_dic[gameinfo.names_left.pop()];
	}
	else
	{
		name="杂牌猩猩";
	}



	var role={
		role_id:uuid.v1(),
		role_did:role_did,
		uid:uid,
		pos_id:pos_id,
		name:name,
		direction_did:2,//防御
		direction_param:[]

	}
	var role_init_property=defaultDataManager.get_d_role_init_property(role_did);
	// console.log(role_init_property);
	//根据初始属性列表，添加初始属性
	for(property_name in role_init_property)
	{
		role[property_name]=role_init_property[property_name];
	}
	gameinfo.roles[role.role_id]=role;



	var sightzoon=maplib.getsightzoon_of_role(role.role_id,gameinfo);
	// console.log(sightzoon.length);
	for(i in sightzoon)
	{
		var pos_id_t=sightzoon[i];

		gameinfo.players[uid].map.landform[pos_id_t]=gameinfo.map.landform[pos_id_t];
		gameinfo.players[uid].map.resource[pos_id_t]=gameinfo.map.resource[pos_id_t];
	}
	return {
		role:role,
		sightzoon:sightzoon
	}
}



//添加building
exports.create_building=function(gameinfo,uid,building_did,pos_id)
{
	if(check_pos_buildingcreatable(gameinfo,pos_id)==false)
	{
		console.log('can not create');
		return;
	}

	var building={
		building_id:uuid.v1(),
		building_did:building_did,
		uid:uid,
		pos_id:pos_id,
		level:1
	}


	var building_init_property=defaultDataManager.get_d_building_init_property(building_did);

	//根据初始属性列表，添加初始属性
	for(property_name in building_init_property)
	{
		building[property_name]=building_init_property[property_name];
	}
	gameinfo.buildings[building.building_id]=building;

	// var user_building={};
	// for(key in building)
	// {
	// 	user_building[key]=building[key];
	// }
	// gameinfo.players[uid].buildings[user_building.building_id]=user_building;
	

	var sightzoon=maplib.getsightzoon_of_building(building.building_id,gameinfo);
	// console.log(sightzoon)
	for(i in sightzoon)
	{
		var pos_id_t=sightzoon[i];
		
		gameinfo.players[uid].map.landform[pos_id_t]=gameinfo.map.landform[pos_id_t];
		gameinfo.players[uid].map.resource[pos_id_t]=gameinfo.map.resource[pos_id_t];
	}
	return {
		building:building,
		sightzoon:sightzoon
	};
}


//此时
var gen_modefied_dic=function(gameinfo,last_pos_dic)
{
	var modefied_dic={};

	for(uid in gameinfo.players)
	{
		modefied_dic[uid]={
			pos:{},
			add_roles:{},
			delete_roles:[],
			landform_map:{},
			resource_map:{},
			add_buildings:{},
			delete_buildings:[]
		};

		//role变化字典
		modefied_dic[uid].pos={};
		var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);
		for(i in insight_roles)
		{
			var role=gameinfo.roles[insight_roles[i]];
			modefied_dic[uid].pos[role.role_id]=role.pos_id;
		}

		//新增role字典
		var add_roles={};
		for(role_id in modefied_dic[uid].pos)
		{
			var role=gameinfo.roles[role_id];
			add_roles[role.role_id]=role;
		}
		//删除role字典  列表
		var delete_roles={};
		var delete_roles_list=[];
		// console.log(last_pos_dic)
		for(role_id in last_pos_dic.pos)
		{
			// var role=gameinfo.roles[role_id];

			delete_roles[role_id]=role_id;
		}
		// console.log(delete_roles);
		for(role_id in add_roles)
		{
			if(delete_roles[role_id]!=undefined)
			{
				delete add_roles[role_id];
				delete delete_roles[role_id];
			}
		}
		// action_list_dic[uid][step].add_roles=add_roles;
		for(role_id in delete_roles)
		{
			delete_roles_list.push(role_id);
		}
		// action_list_dic[uid][step].delete_roles=delete_roles_list;
		modefied_dic[uid].add_roles=add_roles;
		modefied_dic[uid].delete_roles=delete_roles_list;

		//从pos字典中删除新增的角色
		for(role_id in add_roles)
		{
			delete modefied_dic[uid].pos[role_id];
		}

		//地图变化字典
		// var landform_map={};
		// var resource_map={};
		var sightzoon=maplib.getsightzoon_of_player(uid,gameinfo);
		for(id in sightzoon)
		{
			var zoon_id=sightzoon[id];
			// action_list_dic[uid][step].landform_map[zoon_id]=gameinfo.map.landform[zoon_id]*gameinfo.players[uid].map[zoon_id];
			// action_list_dic[uid][step].resource_map[zoon_id]=gameinfo.map.resource[zoon_id]*gameinfo.players[uid].map[zoon_id];
			modefied_dic[uid].landform_map[zoon_id]=gameinfo.map.landform[zoon_id];
			modefied_dic[uid].resource_map[zoon_id]=gameinfo.map.resource[zoon_id];

			gameinfo.players[uid].map.landform[zoon_id]=gameinfo.map.landform[zoon_id];
			gameinfo.players[uid].map.resource[zoon_id]=gameinfo.map.resource[zoon_id];
		}

		//building变化字典
		var buildings_modefied=maplib.get_buildings_modefied_of_player(uid,gameinfo);

		modefied_dic[uid].add_buildings=buildings_modefied.add;
		modefied_dic[uid].delete_buildings=buildings_modefied.delete;
	}

	return modefied_dic;
}

