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
	while(step<11)
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
			//肉图刷新持续时间
			for(pos_id in gameinfo.map.meat)
			{
				var meat_id_and_value=gameinfo.map.meat[pos_id];
				var meat_id=Math.floor(meat_id_and_value/100);
				var meat_value=meat_id_and_value%100;
				if(meat_id==2)
				{
				

					if(meat_value>0)
					{
						meat_value--;
						gameinfo.map.meat[pos_id]=meat_id*100+meat_value;
					}
					else
					{
						gameinfo.map.meat[pos_id]=100;
					}

				}

				//随机位置出现肉
				var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);
				var random_pos_id;
				random_pos_id=Math.floor(Math.random()*gametype.width*gametype.height);
				if(gameinfo.map.meat[random_pos_id]==100)
				{
					//白蚁
					var meat=defaultDataManager.get_d_meat(3);
					gameinfo.map.meat[random_pos_id]=meat.meat_id*100+meat.last_turn;
				}
				random_pos_id=Math.floor(Math.random()*gametype.width*gametype.height);
				if(gameinfo.map.meat[random_pos_id]==100)
				{
					//飞蚁
					var meat=defaultDataManager.get_d_meat(4);
					gameinfo.map.meat[random_pos_id]=meat.meat_id*100+meat.last_turn;
				}
				random_pos_id=Math.floor(Math.random()*gametype.width*gametype.height);
				if(gameinfo.map.meat[random_pos_id]==100)
				{
					//鸟蛋
					var meat=defaultDataManager.get_d_meat(5);
					gameinfo.map.meat[random_pos_id]=meat.meat_id*100+meat.last_turn;
				}
				random_pos_id=Math.floor(Math.random()*gametype.width*gametype.height);
				if(gameinfo.map.meat[random_pos_id]==100)
				{
					//蜂巢
					var meat=defaultDataManager.get_d_meat(6);
					gameinfo.map.meat[random_pos_id]=meat.meat_id*100+meat.last_turn;
				}
			}
			
			//部分数据初始化
			for(uid in gameinfo.players)
			{
				//第一回合开始时的role字典
				var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);//game_total_role,game_total_map,gametype);
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

			//创建临时变量
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				var role_all_property=rolelib.get_role_all_property(role_id,gameinfo);
				role.modified_property={
					blood_sugar:0-role_all_property.basal_metabolism,
					blood_sugar_max:0,
					muscle:0,
					fat:0,
					inteligent:0,
					amino_acid:0,
					breath:0,
					digest:0,
					courage:0,
					life:0,
					skill:{
						type:0,
						id:0
					},

					direction_did:1,
					// direction_param:[],

					//这三个仅用于发送给前端播放动画用
					banana:0,
					meat:0,
					branch:0
					// younger_left:0,
					// growup_left:0,
					// younger_left_max:0,
					// growup_left_max:0,
					// skill_id_list:[],
					// cook_skill_id_list:[]

				};

				// role.all_damage+=role_all_property.basal_metabolism;
			}
			for(uid in gameinfo.players)
			{
				var player=gameinfo.players[uid];
				player.modified_property={
					banana:0,
					meat:0,
					branch:0,
					failed:false
				}
			}

			

			// continue;
		}

		else if(step==1)//||step==3||step==4)
		{
			//创建位置变化字典
			for(uid in gameinfo.players)
			{
				// action_list_dic[uid][step].pos={};
				action_list_dic[uid][step].modifies=[];
			}

			

			for(role_id in gameinfo.roles)
			{
				role=gameinfo.roles[role_id];
				// console.log(role)
				if(role.direction_did==1)
				{
					var role_all_property=rolelib.get_role_all_property(role.role_id,gameinfo);
					role.move=role_all_property.max_move;
					move_roles.push(role_id);
				}
			}


			var some_role_moved;
			do
			{

				gameinfo_sort=gameinfo;
				move_roles.sort(sort_role);

				some_role_moved=false;
				for(i in move_roles)
				{
					var role_id=move_roles[i];
					var role=gameinfo.roles[role_id];

					if(role.direction_param.length>0)
					{
						next_pos=role.direction_param[0];
						if(maplib.get_pos_movable(next_pos,gameinfo))
						{
							//执行移动
							next_pos=role.direction_param.shift();
							if(maplib.do_role_move(role.role_id,role.pos_id,next_pos,gameinfo))
							{
								var role_all_property=rolelib.get_role_all_property(role_id,gameinfo);
								// gameinfo.players[role.uid].activity+=role_all_property.weight;
								role.modified_property.blood_sugar-=role_all_property.basal_metabolism;
								role.modified_property.breath+=1;
								some_role_moved=true;
							}
							// console.log(role)
						}
					}
				}

				for(i in move_roles)
				{
					var role_id=move_roles[i];
					var role=gameinfo.roles[role_id];
					var enemies=maplib.get_enemies(role.role_id,gameinfo);

					if(enemies.type!=0)
					{
						role.move--;
						if(role.move<0)
						{
							role.move=0;
						}
					}

				}

				// if(some_role_moved)
				// {
					
				
				// }
				for(uid in gameinfo.players)
				{
					var modefied_dic;
					var modifies_length=action_list_dic[uid][step].modifies.length;
					if(modifies_length==0)
					{
						modefied_dic=gen_modefied_dic(gameinfo,uid,action_list_dic[uid][0]);
					}
					else
					{
						modefied_dic=gen_modefied_dic(gameinfo,uid,action_list_dic[uid][step].modifies[modifies_length-1]);
					}
					action_list_dic[uid][step].modifies.push(modefied_dic);
					// console.log(modefied_dic);
				}


			}while(some_role_moved)
			
			for(i in move_roles)
			{
				var role_id=move_roles[i];
				var role=gameinfo.roles[role_id];
				delete role.move;
			}



			
		}
		else if(step==2)
		{
			//执行攻击
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				var enemies=maplib.get_enemies(role_id,gameinfo);
				// console.log(enemies);
				
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


				for(role_id_t in role.enemies.roles)
				{
					var role_t=role.enemies.roles[role_id_t];
					var role_t_all_property=rolelib.get_role_all_property(role_t.role_id,gameinfo);
					var damage=role_all_property.muscle*role_all_property.weight*(role.weapon_type_id==0?1:1.2)*(100+role.courage)*(100+role_t.courage)/10000/role_t_all_property.weight/(role_t.direction_did==2?2:1);
					// console.log(damage)
					// gameinfo.players[role.uid].activity+=damage;
					// gameinfo.players[role_t.uid].activity+=damage;
					// role_t.modified_property.blood_sugar-=damage;
					role_t.all_damage+=damage;
					role_t.attacked=1;

				}

				role.modified_property.blood_sugar-=role_all_property.basal_metabolism;
				if(role.enemies.type==0)
				{
					role.modified_property.amino_acid-=role.amino_acid*0.2;
				}
				else
				{
					role.modified_property.amino_acid-=role.amino_acid*0.4;
				}
				
				if(role.younger_left>0)
				{
					role.modified_property.muscle+=role.modified_property.amino_acid*-0.5;
				}
				else if(role.growup_left>0)
				{
					role.modified_property.muscle+=role.modified_property.amino_acid*-1;
				}

				

				// for(enemy_role_id in role.enemies)
				// {
				// 	var enemy=role.enemies[enemy_role_id];
				// 	var enemy_all_property=rolelib.get_role_all_property(enemy.role_id,gameinfo);
				// 	role.all_damage+=(enemy_all_property.muscle*enemy_all_property.health)/role_all_property.weight/Object.keys(enemy.enemies).length;
				// }

				// role.all_damage_int=Math.round(role.blood_sugar*role.all_damage);

				// if(role.all_damage_int>role.blood_sugar)
				// {
				// 	role.all_damage_int=role.blood_sugar;
				// }

				// role.blood_sugar=role.blood_sugar-role.all_damage_int;

				// delete role.all_damage;
				// delete role.enemies;
			}

			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];

				role.all_damage=Math.round(role.all_damage);
				if(role.all_damage>role.blood_sugar)
				{
					role.all_damage=role.blood_sugar;
				}


				
				role.blood_sugar-=role.all_damage;
			}


			

			//写入发送数据
			for(uid in gameinfo.players)
			{
				action_list_dic[uid][step].damage={};
				action_list_dic[uid][step].attack={};
				var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);
				for(i in insight_roles)
				{
					var role=gameinfo.roles[insight_roles[i]];
					if(role.all_damage>0)
					{
						action_list_dic[uid][step].damage[role.role_id]=role.all_damage;
						
					}
					switch(role.enemies.type)
					{
						case 1:
						case 2:
							action_list_dic[uid][step].attack[role.role_id]={
								type:role.enemies.type,
								enemy_pos_id:role.enemies.roles[0].pos_id
							}
							break;
						case 3:
							action_list_dic[uid][step].attack[role.role_id]={
								type:role.enemies.type,
								enemy_pos_id:-1
							}
							break;
					}
					
					
				}
			}

			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				delete role.all_damage;
				// delete role.enemies;
			}
			
			//部分中间过程
			
		}

		//删除blood_sugar为0的角色,并生成尸体
		else if(step==3)
		{
			
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				// console.log(role)
				if(role.blood_sugar==0)
				{
					var d_meat=defaultDataManager.get_d_meat(2);
					gameinfo.map.meat[role.pos_id]=d_meat.meat_id*100+d_meat.last_turn;
					delete gameinfo.roles[role_id];

				}

			}
			for(uid in gameinfo.players)
			{
				var modifies_length=action_list_dic[uid][1].modifies.length;
				var modefied_dic=gen_modefied_dic(gameinfo,uid,action_list_dic[uid][1].modifies[modifies_length-1]);
				// var modefied_dic=gen_modefied_dic(gameinfo,uid,action_list_dic[uid][4]);
				action_list_dic[uid][step]=modefied_dic;
			}


		}

		//寿命减少
		else if(step==4)
		{
			
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				role.modified_property.life-=100;
			}
		}




		// //吃料理
		// else if(step==9)
		// {
			
		// 	//记录变化
		// 	for(role_id in gameinfo.roles)
		// 	{
		// 		var role=gameinfo.roles[role_id];
		// 		var role_all_property=rolelib.get_role_all_property(role.role_id,gameinfo);
		// 		if(role.enemies.type==0&&role.attack==undefined)
		// 		{
					
		// 			if(role.direction_did==8)
		// 			{
		// 				var food=defaultDataManager.get_d_food(role.direction_param[0]);

		// 				if(gameinfo.players[role.uid].banana>=food.banana&&gameinfo.players[role.uid].meat>=food.meat)
		// 				{
		// 					gameinfo.players[role.uid].banana-=food.banana;
		// 					gameinfo.players[role.uid].meat-=food.meat;

		// 					var neibour_role_ids=maplib.get_neibour_role_ids(gameinfo,role.role_id);
		// 					var valid_neibour_role_ids=[];
		// 					for(i in neibour_role_ids)
		// 					{
		// 						var role_id_t=neibour_role_ids[i];
		// 						var role_t=gameinfo.roles[role_id_t];
		// 						if(role_t.uid==role.uid)
		// 						{
		// 							if(role_t.direction_did==2||role_t.direction_did==8)
		// 							{
		// 								if(role_t.enemies.type==0&&role_t.all_damage==0)
		// 								{
		// 									valid_neibour_role_ids.push(role_id_t);
		// 								}
		// 							}
		// 						}
									
		// 					}


		// 					for(i in valid_neibour_role_ids)
		// 					{
		// 						var role_id_t=neibour_role_ids[i];
		// 						var role_t=gameinfo.roles[role_id_t];

		// 						var blood_sugar=food.carbohydrate*role_t.digest/100/neibour_role_ids.length;
		// 						var fat=food.fat*role_t.digest/100/neibour_role_ids.length;

		// 						var inteligent_benifit=role_t.younger_left>0?1.2:1;
		// 						var inteligent=food.minerals*role_t.digest*inteligent_benifit/100/neibour_role_ids.length;
		// 						var amino_acid=food.protein*role_t.digest/100/neibour_role_ids.length;
		// 						var digest=Math.min(100-role_t.digest,food.dietary_fiber*role_t.digest/100/neibour_role_ids.length);
		// 						var life=food.vitamin*role_t.digest/100/neibour_role_ids.length;
		// 						var skill={
		// 							type:0,
		// 							id:0
		// 						}


		// 						if(food.inspire_skill_type!=0&&role_t.role_id==role.role_id)
		// 						{
		// 							var satisfied=true;

		// 							for(i in food.inspire_skill_properties)
		// 							{
		// 								var property=food.inspire_skill_properties[i];
		// 								var value=food.inspire_skill_values[i];
		// 								if(role_all_property[property]<value)
		// 								{
		// 									satisfied=false;
		// 									break;
		// 								}

		// 							}
		// 							// console.log(food.inspire_skill_type)
		// 							// console.log(role.skill_id_list)
		// 							// console.log(role.cook_skill_id_list)
		// 							switch(food.inspire_skill_type)
		// 							{
		// 								case 1:
		// 									if(role.skill_id_list.indexOf(food.inspire_skill_id)!=-1)
		// 									{
		// 										satisfied=false;
		// 									}
		// 									break;
		// 								case 2:
		// 									if(role.cook_skill_id_list.indexOf(food.inspire_skill_id)!=-1)
		// 									{
		// 										satisfied=false;
		// 									}
		// 									break;
		// 							}

		// 							if(satisfied)
		// 							{
		// 								skill.type=food.inspire_skill_type;
		// 								skill.id=food.inspire_skill_id;
		// 							}
		// 						}
								
		// 						role_t.modified_property.blood_sugar+=blood_sugar;
		// 						role_t.modified_property.blood_sugar_max+=blood_sugar_max;
		// 						role_t.modified_property.fat+=fat;
		// 						role_t.modified_property.inteligent+=inteligent;
		// 						role_t.modified_property.amino_acid+=amino_acid;
		// 						role_t.modified_property.digest+=digest;
		// 						role_t.modified_property.life+=life;
		// 						role_t.modified_property.skill=skill;
								
		// 						// if(role_t.food==null)
		// 						// {
		// 						// 	role_t.food={
		// 						// 		direction_did:role.direction_did,
		// 						// 		param:{
		// 						// 			blood_sugar:blood_sugar,
		// 						// 			fat:fat,
		// 						// 			inteligent:inteligent,
		// 						// 			amino_acid:amino_acid,
		// 						// 			digest:digest,
		// 						// 			life:life,
		// 						// 			skill_type:skill.type,
		// 						// 			skill_id:skill.id
		// 						// 		}
		// 						// 	}
		// 						// }
		// 						// else
		// 						// {
		// 						// 	role_t.food.param.blood_sugar+=blood_sugar;
		// 						// 	role_t.food.param.fat+=fat;
		// 						// 	role_t.food.param.inteligent+=inteligent;
		// 						// 	role_t.food.param.amino_acid+=amino_acid;
		// 						// 	role_t.food.param.digest+=digest;
		// 						// 	role_t.food.param.life+=life;
		// 						// 	if(skill.type!=0)
		// 						// 	{
		// 						// 		role_t.food.param.skill_type=skill.type;
		// 						// 		role_t.food.param.skill_id=skill.id;
		// 						// 	}

		// 						// }
								
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}

		// 	//变更属性
		// 	// for(uid in gameinfo.players)
		// 	// {
		// 	// 	action_list_dic[uid][step].food={};
		// 	// }

		// 	// for(role_id in gameinfo.roles)
		// 	// {
		// 	// 	var role=gameinfo.roles[role_id];
		// 	// 	if(!!role.food)
		// 	// 	{
		// 	// 		// role.blood_sugar+=role.food.blood_sugar;
		// 	// 		// console.log(role.blood_sugar_max)
		// 	// 		// 
		// 	// 		role.blood_sugar_max+=role.food.param.blood_sugar;
		// 	// 		role.fat+=role.food.param.fat;
		// 	// 		role.inteligent+=role.food.param.inteligent;
		// 	// 		role.amino_acid+=role.food.param.amino_acid;
		// 	// 		role.digest+=role.food.param.digest;
		// 	// 		if(role.younger_left>0)
		// 	// 		{
		// 	// 			role.younger_left+=role.food.param.life;
		// 	// 			role.younger_left_max+=role.food.param.life;
		// 	// 		}
		// 	// 		else if(role.growup_left>0)
		// 	// 		{
		// 	// 			role.growup_left+=role.food.param.life;
		// 	// 			role.growup_left_max+=role.food.param.life;
		// 	// 		}
		// 	// 		switch(role.food.param.skill_type)
		// 	// 		{
		// 	// 			case 1:
		// 	// 				role.skill_id_list.push(role.food.param.skill_id);
		// 	// 				break;
		// 	// 			case 2:
		// 	// 				role.cook_skill_id_list.push(role.food.param.skill_id);
		// 	// 				break;
		// 	// 		}


		// 	// 		action_list_dic[role.uid][step].food[role.role_id]=role.food;
		// 	// 	}
		// 	// }

		// 	//删除临时变量
		// 	// for(role_id in gameinfo.roles)
		// 	// {
		// 	// 	var role=gameinfo.roles[role_id];
		// 	// 	// if(role.moved!=undefined)
		// 	// 	// {
		// 	// 	// 	delete role.moved;
		// 	// 	// }
		// 	// 	if(!!role.action)
		// 	// 	{
		// 	// 		delete role.action;
		// 	// 	}
		// 	// 	if(!!role.food)
		// 	// 	{
		// 	// 		delete role.food;
		// 	// 	}
		// 	// 	// if(role.all_damage_int!=undefined)
		// 	// 	// {
		// 	// 	// 	delete role.all_damage_int;
		// 	// 	// }

		// 	// 	delete role.all_damage;
		// 	// 	delete role.enemies;
		// 	// }


		// }


		


		//改变地形、资源，建造建筑，进食
		//特殊指令分两步进行，先执行造成视野变化的部分，再执行不造成视野变化的部分
		//视野变化部分
		else if(step==5)
		{

			for(role_id in gameinfo.roles)
			{
				// console.log(role.moved);
				var role=gameinfo.roles[role_id];
				var role_all_property=rolelib.get_role_all_property(role.role_id,gameinfo);

				if(role.enemies.type==0&&role.attack==undefined)
				{

					switch(role.direction_did)
					{


						// //招募采集猴
						// case 5:
						// 	if(gameinfo.players[role.uid].banana>=defaultDataManager.get_d_building(3).cost)
						// 	{
						// 		var create_info = exports.create_building(gameinfo,role.uid,3,role.pos_id);
						// 		// gameinfo.players[role.uid].banana-defaultDataManager.get_d_building(3).cost;
								

						// 	}

							
						// 	break;

						// //驱赶猴子
						// case 6:
						// 	for(building_id in gameinfo.buildings)
						// 	{
						// 		var building=gameinfo.buildings[building_id];
						// 		if(building.pos_id==role.pos_id)
						// 		{
						// 			delete gameinfo.buildings[building_id];
						// 			break;
						// 		}
						// 	}

						// 	break;


						//搭窝
						// case 9:
						// 	if(gameinfo.players[role.uid].banana>=defaultDataManager.get_d_building(1).cost)
						// 	{
						// 		exports.create_building(gameinfo,role.uid,1,role.pos_id);
						// 		// gameinfo.players[role.uid].banana-defaultDataManager.get_d_building(1).cost;

						// 	}
						// 	// else
						// 	// {
						// 	// 	role.direction_did=12;
						// 	// }
						// 	break;
						//长眠
						// case 10:
						// 	var role_all_property=rolelib.get_role_all_property(role.role_id,gameinfo);
						// 	// gameinfo.players[building.uid].activity+=role_all_property.weight;
						// 	delete gameinfo.roles[role.role_id];

						// 	break;
						//哺育
						case 11:
							if(role.blood_sugar>=role.blood_sugar_max*0.8)
							{
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
									// var create_role = exports.create_role(gameinfo,role.uid,2,selected_pos_id);
									var child_role = exports.born_role(gameinfo,role,selected_pos_id);

									var damage=0.2*role.blood_sugar_max;
									role.modified_property.blood_sugar-=damage;
									// var role_all_property=rolelib.get_role_all_property(create_role.role.role_id,gameinfo);
									// gameinfo.players[building.uid].activity+=role_all_property.weight;
								}
							}
								
							

							break;

						// //搜索
						// case 13:
						// 	gameinfo.map.meat[role.pos_id]=100;
						// 	break;

						// //拆除
						// case 14:
						// 	for(building_id in gameinfo.buildings)
						// 	{
						// 		var building=gameinfo.buildings[building_id];
						// 		if(building.pos_id==role.pos_id)
						// 		{
						// 			// gameinfo.players[building.uid].activity+=defaultDataManager.get_d_building(3).cost;
						// 			delete gameinfo.buildings[building_id];
						// 			break;
						// 		}
						// 	}

							break;

					}
				}
				
			}





			
			
			// console.log(modefied_dic)
			for(uid in gameinfo.players)
			{
				// var modifies_length=action_list_dic[uid][1].modifies.length;
				// var modefied_dic=gen_modefied_dic(gameinfo,uid,action_list_dic[uid][1].modifies[modifies_length-1]);
				var modefied_dic=gen_modefied_dic(gameinfo,uid,action_list_dic[uid][3]);
				action_list_dic[uid][step]=modefied_dic;
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
		//更新猴子的与家距离
		// else if(step==7)
		// {
		// 	for(uid in gameinfo.players)
		// 	{
		// 		action_list_dic[uid][step].distance={};

		// 		var buildings_in_sightzoon=maplib.get_buildings_in_sightzoon_of_player(uid,gameinfo);
		// 		for(building_id in buildings_in_sightzoon)
		// 		{
		// 			var building=gameinfo.buildings[building_id];
		// 			if(building.building_did==3)
		// 			{
		// 				action_list_dic[uid][step].distance[building_id]=building.distance_from_home;
		// 			}
					
		// 		}

		// 	}


		// }


		//不造成角色、建筑、视野变化的指令
		else if(step==6)
		{
			
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				var role_all_property=rolelib.get_role_all_property(role.role_id,gameinfo);

				if(role.enemies.type==0&&role.attack==undefined)
				{
					
					switch(role.direction_did)
					{
						//采集
						case 3:
							// gameinfo.map.resource[role.pos_id]=2;
							var resource_id=gameinfo.map.resource[role.pos_id];
							var resourceinfo=defaultDataManager.get_d_resource(resource_id);
							var distance=maplib.get_nearist_home_distance(gameinfo,role.uid,role.pos_id)
							var banana=resourceinfo.base_food*(role.inteligent<resourceinfo.inteligent_need?role.inteligent/resourceinfo.inteligent_need:1);
							if(banana!=-1)
							{
								banana=banana*(2-distance/10);
							}
							banana=Math.round(banana);
							role.modified_property.banana+=banana;
							role.modified_property.direction_did=3;
							gameinfo.players[role.uid].modified_property.banana+=banana;

							break;

						//招募采集猴
						// case 5:

							// gameinfo.players[role.uid].banana-defaultDataManager.get_d_building(3).cost;



							// gameinfo.players[role.uid].activity+=defaultDataManager.get_d_building(3).cost;
							// role.action={
							// 	direction_did:role.direction_did,
							// 	param:{
							// 		cost:defaultDataManager.get_d_building(3).cost
							// 	}
							// }
							
							// break;
						

						//升级
						// case 7:
						// 	var building_id_t;
						// 	for(building_id in gameinfo.buildings)
						// 	{
						// 		if(gameinfo.buildings[building_id].pos_id==role.pos_id)
						// 		{
						// 			building_id_t=building_id;
						// 			gameinfo.buildings[building_id].level++;
						// 			break;
						// 		}
						// 	}
						// 	role.action={
						// 		direction_did:role.direction_did,
						// 		param:{
						// 			cost:building_id_t
						// 		}
						// 	}
						// 	break;

						//吃料理
						// case 8:
						// 	var food=defaultDataManager.get_d_food(role.direction_param[0]);

						// 	if(gameinfo.players[role.uid].banana>=0&&gameinfo.players[role.uid].meat>=0)
						// 	{
						// 		gameinfo.players[role.uid].modified_property.banana-=food.banana;
						// 		gameinfo.players[role.uid].modified_property.meat-=food.meat;

						// 		var neibour_role_ids=maplib.get_neibour_role_ids(gameinfo,role.role_id);

						// 		var valid_neibour_role_ids=[];
						// 		for(i in neibour_role_ids)
						// 		{
						// 			var role_id_t=neibour_role_ids[i];
						// 			var role_t=gameinfo.roles[role_id_t];
						// 			if(role_t.uid==role.uid)
						// 			{
						// 				if(role_t.direction_did==2||role_t.direction_did==8)
						// 				{
						// 					if(role_t.enemies.type==0&&role_t.attacked==undefined)
						// 					{
						// 						valid_neibour_role_ids.push(role_id_t);
						// 					}
						// 				}
						// 			}
										
						// 		}


						// 		for(i in valid_neibour_role_ids)
						// 		{
						// 			var role_id_t=neibour_role_ids[i];
						// 			var role_t=gameinfo.roles[role_id_t];

						// 			var blood_sugar=food.carbohydrate*role_t.digest/100/neibour_role_ids.length;
						// 			var fat=food.fat*role_t.digest/100/neibour_role_ids.length;

						// 			var inteligent_benifit=role_t.younger_left>0?1.2:1;
						// 			var inteligent=food.minerals*role_t.digest*inteligent_benifit/100/neibour_role_ids.length;
						// 			var amino_acid=food.protein*role_t.digest/100/neibour_role_ids.length;
						// 			var digest=Math.min(100-role_t.digest,food.dietary_fiber*role_t.digest/100/neibour_role_ids.length);
						// 			var life=food.vitamin*role_t.digest/100/neibour_role_ids.length;
						// 			var skill={
						// 				type:0,
						// 				id:0
						// 			}


						// 			if(food.inspire_skill_type!=0&&role_t.role_id==role.role_id)
						// 			{
						// 				var satisfied=true;

						// 				for(i in food.inspire_skill_properties)
						// 				{
						// 					var property=food.inspire_skill_properties[i];
						// 					var value=food.inspire_skill_values[i];
						// 					if(role_all_property[property]<value)
						// 					{
						// 						satisfied=false;
						// 						break;
						// 					}

						// 				}

						// 				switch(food.inspire_skill_type)
						// 				{
						// 					case 1:
						// 						if(role.skill_id_list.indexOf(food.inspire_skill_id)!=-1)
						// 						{
						// 							satisfied=false;
						// 						}
						// 						break;
						// 					case 2:
						// 						if(role.cook_skill_id_list.indexOf(food.inspire_skill_id)!=-1)
						// 						{
						// 							satisfied=false;
						// 						}
						// 						break;
						// 				}

						// 				if(satisfied)
						// 				{
						// 					skill.type=food.inspire_skill_type;
						// 					skill.id=food.inspire_skill_id;
						// 				}
						// 			}
									
						// 			role_t.modified_property.blood_sugar+=blood_sugar;
						// 			role_t.modified_property.blood_sugar_max+=blood_sugar;
						// 			role_t.modified_property.fat+=fat;
						// 			role_t.modified_property.inteligent+=inteligent;
						// 			role_t.modified_property.amino_acid+=amino_acid;
						// 			role_t.modified_property.digest+=digest;
						// 			role_t.modified_property.life+=life;
						// 			role_t.modified_property.skill=skill;
									
						// 		}
						// 	}

						// 	break;


						//搭窝
						// case 9:
						// 	var d_building=defaultDataManager.get_d_building(1);
						// 	gameinfo.players[role.uid].modified_property[d_building.cost_key]-=d_building.cost_value;
						// 	role.modified_property[d_building.cost_key]-=d_building.cost_value;
						// 	// gameinfo.players[role.uid].banana-defaultDataManager.get_d_building(1).cost;
						// 	// gameinfo.players[role.uid].activity+=defaultDataManager.get_d_building(1).cost;
						// 	// role.action={
						// 	// 	direction_did:role.direction_did,
						// 	// 	param:{
						// 	// 		cost:defaultDataManager.get_d_building(1).cost
						// 	// 	}
						// 	// }
						// 	break;
						
						//哺育
						// case 11:

							// var new_blood_sugar=Math.floor(role.blood_sugar*0.5);
							// var damage=role.blood_sugar-new_blood_sugar;
							// role.blood_sugar=new_blood_sugar;
							// role.action={
							// 	direction_did:role.direction_did,
							// 	param:{
							// 		damage:damage
							// 	}
							// }
							// break;

						//搜索
						// case 13:
						// 	var meat_id_and_value=gameinfo.map.meat[role.pos_id];
						// 	var meat_id=Math.floor(meat_id_and_value/100);
						// 	var meatinfo=defaultDataManager.get_d_meat(meat_id);
						// 	var distance=maplib.get_nearist_home_distance(gameinfo,role.uid,role.pos_id)
						// 	var meat=meatinfo.base_food*(role.inteligent<meatinfo.inteligent_need?role.inteligent/meatinfo.inteligent_need:1);
						// 	if(meat!=-1)
						// 	{
						// 		meat=meat*(2-distance/10);
						// 	}
						// 	meat=Math.floor(meat);

						// 	role.modified_property.meat+=meat;
						// 	role.modified_property.direction_did=13;
						// 	gameinfo.players[role.uid].modified_property.meat+=meat;

						// 	break;
					}
				}
				// delete role.moved;
			}


			//写入发送数据
			// for(uid in gameinfo.players)
			// {
			// 	action_list_dic[uid][step].action={};
			// 	var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);
			// 	for(i in insight_roles)
			// 	{
			// 		var role=gameinfo.roles[insight_roles[i]];
			// 		if(role.action!=undefined)
			// 		{
			// 			action_list_dic[uid][step].action[role.role_id]=role.action;
			// 			delete role.action;
			// 		}
			// 	}
			// }

			




			continue;
		}

		

		




		
		


		//采集猴子收益
		// else if(step==10)
		// {
		// 	for(uid in gameinfo.players)
		// 	{
		// 		action_list_dic[uid][step].banana={};
		// 	}

		// 	for(building_id in gameinfo.buildings)
		// 	{
		// 		var building=gameinfo.buildings[building_id];

		// 		//猴子
		// 		if(building.building_did==3)
		// 		{
		// 			if(building.distance_from_home!=-1)
		// 			{
		// 				var banana=Math.floor(10*(1-building.distance_from_home*0.1));
		// 				gameinfo.players[building.uid].banana+=banana;
		// 				// gameinfo.players[building.uid].activity+=banana;
		// 				action_list_dic[building.uid][step].banana[building_id]=banana;
		// 			}
						
		// 		}

		// 	}

		// }

		//回血
		else if(step==7)
		{
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				var role_all_property=rolelib.get_role_all_property(role_id,gameinfo);

				
				if(!!role.modified_property)
				{
					//回血
					var recovery=Math.min(role.blood_sugar_max-role.blood_sugar,role.breath/100*(2-role_all_property.health)*role.fat);
					role.modified_property.blood_sugar+=recovery;
					role.modified_property.fat-=recovery;
				}
			}

		}

		//角色变更属性
		else if(step==8)
		{
			
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				var role_all_property=rolelib.get_role_all_property(role_id,gameinfo);

				
				if(!!role.modified_property)
				{

					//检查血量
					if(role.blood_sugar+role.modified_property.blood_sugar<0)
					{
						role.modified_property.blood_sugar=-1*role.blood_sugar;
					}
					if(role.blood_sugar+role.modified_property.blood_sugar>role.blood_sugar_max+role.modified_property.blood_sugar_max)
					{
						role.modified_property.blood_sugar=role.blood_sugar_max+role.modified_property.blood_sugar_max-role.blood_sugar;
					}

					//四舍五入
					role.modified_property.blood_sugar=Math.round(role.modified_property.blood_sugar);
					role.modified_property.blood_sugar_max=Math.round(role.modified_property.blood_sugar_max);
					role.modified_property.muscle=Math.round(role.modified_property.muscle);
					role.modified_property.fat=Math.round(role.modified_property.fat);
					role.modified_property.inteligent=Math.round(role.modified_property.inteligent);
					role.modified_property.amino_acid=Math.round(role.modified_property.amino_acid);
					role.modified_property.breath=Math.round(role.modified_property.breath);
					role.modified_property.digest=Math.round(role.modified_property.digest);
					role.modified_property.courage=Math.round(role.modified_property.courage);
					role.modified_property.life=Math.round(role.modified_property.life);


					//更改
					role.blood_sugar+=role.modified_property.blood_sugar;
					role.blood_sugar_max+=role.modified_property.blood_sugar_max;
					role.muscle+=role.modified_property.muscle;
					role.fat+=role.modified_property.fat;
					role.inteligent+=role.modified_property.muscle;
					role.amino_acid+=role.modified_property.amino_acid;
					role.breath+=role.modified_property.breath;
					role.digest+=role.modified_property.digest;
					role.courage+=role.modified_property.courage;

					role.younger_left+=role.modified_property.life;
					if(role.younger_left<0)
					{
						role.growup_left+=role.younger_left;
						role.younger_left=0;
					}
					if(role.growup_left<0)
					{
						role.growup_left=0;
					}

					if(role.modified_property.skill.type==1)
					{
						role.skill_id_list.push(role.modified_property.skill.id);
					}
					else if(role.modified_property.skill.type==2)
					{
						role.cook_skill_id_list.push(role.modified_property.skill.id);
					}

					role.direction_did=role.modified_property.direction_did;
					role.direction_param=[];//role.modified_property.direction_param;


					
				}

				


				// role.blood_sugar+=recovery;
				// role.fat-=recovery;

				// gameinfo.players[role.uid].activity+=recovery;

				//写入临时数据
				// role.recovery=recovery;
					

			}



			//写入发送数据
			for(uid in gameinfo.players)
			{
				action_list_dic[uid][step].roles={};
				var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);
				for(i in insight_roles)
				{
					var role=gameinfo.roles[insight_roles[i]];
					if(!!role.modified_property)
					{
						action_list_dic[uid][step].roles[role.role_id]=role.modified_property;
					}
					
				}
			}

			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				delete role.modified_property;

				//删除临时变量
				if(!!role.attacked)
				{
					delete role.attacked;
				}
				
			}
			continue;
		}

		//删除blood_sugar为0的角色,并生成尸体
		else if(step==9)
		{
			
			for(role_id in gameinfo.roles)
			{
				var role=gameinfo.roles[role_id];
				if(role.blood_sugar==0)
				{
					var d_meat=defaultDataManager.get_d_meat(2);
					gameinfo.map.meat[role.pos_id]=d_meat.meat_id*100+d_meat.last_turn;
					delete gameinfo.roles[role_id];

				}

			}
			for(uid in gameinfo.players)
			{
				// var modifies_length=action_list_dic[uid][1].modifies.length;
				// var modefied_dic=gen_modefied_dic(gameinfo,uid,action_list_dic[uid][1].modifies[modifies_length-1]);
				var modefied_dic=gen_modefied_dic(gameinfo,uid,action_list_dic[uid][5]);
				action_list_dic[uid][step]=modefied_dic;
			}


		}
		
		//同步玩家数据
		else if(step==10)
		{
			for(uid in gameinfo.players)
			{
				var player=gameinfo.players[uid];

				//四舍五入
				player.modified_property.banana=Math.round(player.modified_property.banana);
				player.modified_property.meat=Math.round(player.modified_property.meat);
				player.modified_property.branch=Math.round(player.modified_property.branch);


				player.banana+=player.modified_property.banana;
				player.meat+=player.modified_property.meat;
				player.branch+=player.modified_property.branch;

				action_list_dic[uid][step].money={
					banana:player.modified_property.banana,
					meat:player.modified_property.meat,
					branch:player.modified_property.branch,
					group:exports.get_population_genetic_info(gameinfo,uid)
				};
			}
		}

		//更新分数
		else if(step==11)
		{
			// for(uid_1 in gameinfo.players)
			// {
			// 	action_list_dic[uid_1][step].total_weight={};
			// 	for(uid_2 in gameinfo.players)
			// 	{
			// 		action_list_dic[uid_1][step].total_weight[uid_2]=0;
			// 	}
			// }
				
			// for(role_id in gameinfo.roles)
			// {
			// 	var role=gameinfo.roles[role_id];
			// 	var role_all_property=rolelib.get_role_all_property(role_id,gameinfo);

			// 	for(uid in gameinfo.players)
			// 	{
			// 		action_list_dic[uid][step].total_weight[role.uid]+=role_all_property.weight;
			// 	}
				
			// }
			var weight_dic=exports.get_all_weight(gameinfo);
			for(uid in gameinfo.players)
			{
				action_list_dic[uid][step].weight_dic=weight_dic;
			}
		}

		//gameover
		// else if(step==12)
		// {
		// 	gameover=exports.get_gameover(gameinfo);
		// 	for(uid in gameinfo.players)
		// 	{
		// 		action_list_dic[uid][step].gameover=gameover;
		// 	}
		// }
		
	}

	//删除临时变量
	for(role_id in gameinfo.roles)
	{
		var role=gameinfo.roles[role_id];
		delete role.enemies;
		delete role.modified_property;
	}
	for(uid in gameinfo.players)
	{
		var player=gameinfo.players[uid];
		delete player.modified_property;
	}


	//设定默认指令
	// for(role_id in gameinfo.roles)
	// {
	// 	var role=gameinfo.roles[role_id];
		
	// 	role.direction_did=2;
	// 	role.direction_param=[];
	// }
	// for(building_id in gameinfo.buildings)
	// {
	// 	var building=gameinfo.buildings[building_id];
	// 	building.direction_did=0;
	// }

	//更新回合数
	gameinfo.game.current_turn++;

	// console.log(gameinfo.players);
	var gameover=exports.get_gameover(gameinfo);
	return {
		action_list_dic:action_list_dic,
		gameover:gameover
	}
}








//8 9 10 13 14
exports.execute_sub_direction=function(gameinfo,role_id,direction_did,direction_param)
{
	var role=gameinfo.roles[role_id];
	if(role.direction_did==15)
	{
		return;
	}
	if(role.infight==1)
	{
		return;
	}

	//存储指令、更新用户指令turn
	role.direction_did=direction_did;
	role.direction_param=direction_param;

	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);

	var width=gametype.width;
	var height=gametype.height;


	
	// var uid=role.uid;

	



	for(uid in gameinfo.players)
	{
		var player=gameinfo.players[uid];
		player.modified_property={
			banana:0,
			meat:0,
			branch:0,
			failed:false
		}
	}


	var start_dic={};
	var action_dic={};
	// var property_dic={};
	for(uid in gameinfo.players)
	{
		start_dic[uid]={};
		action_dic[uid]={};
		// property_dic[uid]={};

		//开始时的role字典
		var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);//game_total_role,game_total_map,gametype);
		start_dic[uid].pos={};
		for(i in insight_roles)
		{
			var role_t=gameinfo.roles[insight_roles[i]];
			start_dic[uid].pos[role_t.role_id]=role_t.pos_id;
		}

		//新增role字典
		start_dic[uid].add_roles={};
		// start_dic[uid].delete_roles=[];

		// //地图变化字典
		// start_dic[uid].landform_map={};
		// start_dic[uid].resource_map={};
		// var sightzoon=maplib.getsightzoon_of_player(uid,gameinfo);
		// for(id in sightzoon)
		// {
		// 	var zoon_id=sightzoon[id];
		// 	start_dic[uid].landform_map[zoon_id]=gameinfo.map.landform[zoon_id];
		// 	start_dic[uid].resource_map[zoon_id]=gameinfo.map.resource[zoon_id];
		// }

		// //新增、删除building字典，占位用
		// start_dic[uid].add_buildings={};
		// start_dic[uid].delete_buildings=[];


	}



	
	//临时变量
	role.modified_property={
		blood_sugar:0,
		blood_sugar_max:0,
		muscle:0,
		fat:0,
		inteligent:0,
		amino_acid:0,
		breath:0,
		digest:0,
		courage:0,
		life:0,
		skill:{
			type:0,
			id:0
		},

		direction_did:15,
		// direction_param:[],

		//这三个仅用于发送给前端播放动画用
		banana:0,
		meat:0,
		branch:0


	};
	role.direction_did=15;
	switch(direction_did)
	{
		//采集
		// case 3:
		// 	// gameinfo.map.resource[role.pos_id]=2;
		// 	var resource_id=gameinfo.map.resource[role.pos_id];
		// 	var resourceinfo=defaultDataManager.get_d_resource(resource_id);
		// 	var distance=maplib.get_nearist_home_distance(gameinfo,role.uid,role.pos_id)
		// 	var banana=resourceinfo.base_food*(role.inteligent<resourceinfo.inteligent_need?role.inteligent/resourceinfo.inteligent_need:1);
		// 	if(distance!=-1)
		// 	{
		// 		banana=banana*(2-distance/10);
		// 	}
		// 	banana=Math.round(banana);
		// 	role.modified_property.banana+=banana;
		// 	role.modified_property.direction_did=3;
		// 	gameinfo.players[role.uid].modified_property.banana+=banana;


		// 	break;
		//吃料理
		case 8:
			var food=defaultDataManager.get_d_food(role.direction_param[0]);

			if(gameinfo.players[role.uid].banana>=food.banana&&gameinfo.players[role.uid].meat>=food.meat)
			{
				gameinfo.players[role.uid].banana-=food.banana;
				gameinfo.players[role.uid].meat-=food.meat;

				var neibour_role_ids=maplib.get_neibour_role_ids(gameinfo,role.role_id);

				var valid_neibour_role_ids=[];
				for(i in neibour_role_ids)
				{
					var role_id_t=neibour_role_ids[i];
					var role_t=gameinfo.roles[role_id_t];
					if(role_t.uid==role.uid)
					{
						if(role_t.infight==0)
						{
							valid_neibour_role_ids.push(role_id_t);
						}
						if(role_t.role_id!=role.role_id)
						{
							//临时变量
							role_t.modified_property={
								blood_sugar:0,
								blood_sugar_max:0,
								muscle:0,
								fat:0,
								inteligent:0,
								amino_acid:0,
								breath:0,
								digest:0,
								courage:0,
								life:0,
								skill:{
									type:0,
									id:0
								},

								direction_did:1,
								// direction_param:[],

								//这三个仅用于发送给前端播放动画用
								banana:0,
								meat:0,
								branch:0


							};
						}
					}
						
				}


				for(i in valid_neibour_role_ids)
				{
					var role_id_t=neibour_role_ids[i];
					var role_t=gameinfo.roles[role_id_t];

					var blood_sugar=Math.floor(food.carbohydrate*role_t.digest/100/neibour_role_ids.length);
					var fat=Math.floor(food.fat*role_t.digest/100/neibour_role_ids.length);

					var inteligent_benifit=role_t.younger_left>0?1.2:1;
					var inteligent=Math.floor(food.minerals*role_t.digest*inteligent_benifit/100/neibour_role_ids.length);
					var amino_acid=Math.floor(food.protein*role_t.digest/100/neibour_role_ids.length);
					var digest=Math.floor(Math.min(100-role_t.digest,food.dietary_fiber*role_t.digest/100/neibour_role_ids.length));
					var life=Math.floor(food.vitamin*role_t.digest/100/neibour_role_ids.length);
					var skill={
						type:0,
						id:0
					}


					if(food.inspire_skill_type!=0&&role_t.role_id==role.role_id)
					{
						var satisfied=true;

						for(i in food.inspire_skill_properties)
						{
							var property=food.inspire_skill_properties[i];
							var value=food.inspire_skill_values[i];
							if(role_all_property[property]<value)
							{
								satisfied=false;
								break;
							}

						}

						switch(food.inspire_skill_type)
						{
							case 1:
								if(role.skill_id_list.indexOf(food.inspire_skill_id)!=-1)
								{
									satisfied=false;
								}
								break;
							case 2:
								if(role.cook_skill_id_list.indexOf(food.inspire_skill_id)!=-1)
								{
									satisfied=false;
								}
								break;
						}

						if(satisfied)
						{
							skill.type=food.inspire_skill_type;
							skill.id=food.inspire_skill_id;
						}
					}
					
					role_t.modified_property.blood_sugar+=blood_sugar;
					role_t.modified_property.blood_sugar_max+=blood_sugar;
					role_t.modified_property.fat+=fat;
					role_t.modified_property.inteligent+=inteligent;
					role_t.modified_property.amino_acid+=amino_acid;
					role_t.modified_property.digest+=digest;
					role_t.modified_property.life+=life;
					role_t.modified_property.skill=skill;

					role_t.blood_sugar+=blood_sugar;
					role_t.blood_sugar_max+=blood_sugar;
					role_t.fat+=fat;
					role_t.inteligent+=inteligent;
					role_t.amino_acid+=amino_acid;
					role_t.digest+=digest;
					role_t.life+=life;
					switch(skill.type)
					{
						case 1:
							role_t.skill_id_list.push(skill.id);
							break;
						case 2:
							role_t.cook_skill_id_list.push(skill.id);
							break;
					}
					
				}
			}

			break;
		//搭窝
		case 9:
			
			var d_building=defaultDataManager.get_d_building(1);
			if(gameinfo.players[role.uid][d_building.cost_key]>=d_building.cost_value)
			{
				exports.create_building(gameinfo,role.uid,1,role.pos_id);
				// gameinfo.players[role.uid].banana-defaultDataManager.get_d_building(1).cost;
				gameinfo.players[role.uid][d_building.cost_key]-=d_building.cost_value;
				role.modified_property[d_building.cost_key]-=d_building.cost_value;
			}

			break;
		//长眠
		case 10:
			if(role.infight==0)
			{
				delete gameinfo.roles[role.role_id];
			}
			

			break;
		// //哺育
		// case 11:
		// 	if(role.blood_sugar>=role.blood_sugar_max*0.8)
		// 	{
		// 		var neibour_ids=maplib.get_neibour_ids(gameinfo,role.pos_id);
		// 		var new_ids=[];
		// 		for(i in neibour_ids)
		// 		{
		// 			var neibour_pos_id=neibour_ids[i];
		// 			var in_that_pos=false;
		// 			for(role_id in gameinfo.roles)
		// 			{
		// 				var role=gameinfo.roles[role_id];
		// 				if(role.pos_id==neibour_pos_id)
		// 				{
		// 					in_that_pos=true;
		// 					break;
		// 				}
		// 			}
		// 			if(!in_that_pos)
		// 			{
		// 				new_ids.push(neibour_pos_id);
		// 			}
		// 		}
		// 		if(new_ids.length>0)
		// 		{
		// 			var random_id=Math.floor(Math.random()*new_ids.length);
		// 			var selected_pos_id=new_ids[random_id];
		// 			// var create_role = exports.create_role(gameinfo,role.uid,2,selected_pos_id);
		// 			var child_role = exports.born_role(gameinfo,role,selected_pos_id);

		// 			var damage=0.2*role.blood_sugar_max;
		// 			role.modified_property.blood_sugar-=damage;
		// 			// var role_all_property=rolelib.get_role_all_property(create_role.role.role_id,gameinfo);
		// 			// gameinfo.players[building.uid].activity+=role_all_property.weight;
		// 		}
		// 	}
				
			

		// 	break;

		//搜索
		case 13:
			var meat_id_and_value=gameinfo.map.meat[role.pos_id];
			var meat_id=Math.floor(meat_id_and_value/100);
			var meatinfo=defaultDataManager.get_d_meat(meat_id);
			var distance=maplib.get_nearist_home_distance(gameinfo,role.uid,role.pos_id)
			var meat=meatinfo.base_food*(role.inteligent<meatinfo.inteligent_need?role.inteligent/meatinfo.inteligent_need:1);
			if(distance!=-1)
			{
				meat=meat*(2-distance/10);
			}
			meat=Math.round(meat);
			role.modified_property.meat+=meat;
			// role.modified_property.direction_did=13;
			gameinfo.players[role.uid].meat+=meat;

			gameinfo.map.meat[role.pos_id]=100;

			break;

		//拆除
		case 14:
			for(building_id in gameinfo.buildings)
			{
				var building=gameinfo.buildings[building_id];
				if(building.pos_id==role.pos_id)
				{
					// gameinfo.players[building.uid].activity+=defaultDataManager.get_d_building(3).cost;
					delete gameinfo.buildings[building_id];
					break;
				}
			}

			break;

	}





	
	// var gameover=exports.get_gameover(gameinfo);
	// console.log(modefied_dic)
	for(uid in gameinfo.players)
	{
		// var modifies_length=action_list_dic[uid][1].modifies.length;
		// var modefied_dic=gen_modefied_dic(gameinfo,uid,action_list_dic[uid][1].modifies[modifies_length-1]);
		// console.log(start_dic)
		var modified_dic=gen_modefied_dic(gameinfo,uid,start_dic[uid]);
		action_dic[uid]={};
		action_dic[uid].modified_dic=modified_dic;
		action_dic[uid].property_dic={};
		action_dic[uid].weight_dic=exports.get_all_weight(gameinfo);
		// action_dic[uid].gameover=gameover;
		// console.log(modified_dic)

		var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);
		for(i in insight_roles)
		{
			var role_t=gameinfo.roles[insight_roles[i]];
			if(!!role_t.modified_property)
			{
				action_dic[uid].property_dic[role_t.role_id]=role_t.modified_property;
			}
		}

		// for(uid_2 in gameinfo.players)
		// {
		// 	action_dic[uid].weight_dic[uid_2]=0;
		// }


				
		

	}

	// for(role_id in gameinfo.roles)
	// {
	// 	var role=gameinfo.roles[role_id];
	// 	var role_all_property=rolelib.get_role_all_property(role_id,gameinfo);

	// 	for(uid in gameinfo.players)
	// 	{
	// 		action_dic[uid].weight_dic[role.uid]+=role_all_property.weight;
	// 	}
		
	// }

	for(role_id_t in gameinfo.roles)
	{
		var role_t=gameinfo.roles[role_id_t];
		if(!!role_t.modified_property)
		{
			delete role_t.modified_property;
		}
	}



	return action_dic;
	// return {
	// 	action_dic:action_dic,
	// 	gameover:gameover
	// }

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
		direction_did:1,//攻击
		direction_param:[]

	}
	var role_init_property=defaultDataManager.get_d_role_init_property(role_did);

	//根据初始属性列表，添加初始属性
	for(property_name in role_init_property)
	{
		role[property_name]=role_init_property[property_name];
	}
	gameinfo.roles[role.role_id]=role;



	var sightzoon=maplib.getsightzoon_of_role(role.role_id,gameinfo);

	for(i in sightzoon)
	{
		var pos_id_t=sightzoon[i];

		gameinfo.players[uid].map.landform[pos_id_t]=gameinfo.map.landform[pos_id_t];
		gameinfo.players[uid].map.resource[pos_id_t]=gameinfo.map.resource[pos_id_t];
		gameinfo.players[uid].map.meat[pos_id_t]=gameinfo.map.meat[pos_id_t];
	}

	return {
		role:role,
		sightzoon:sightzoon
	}
}

exports.born_role=function(gameinfo,parent_role,pos_id)
{
	var population_genetic_info=exports.get_population_genetic_info(gameinfo,parent_role.uid);

	var child_role=exports.create_role(gameinfo,parent_role.uid,parent_role.role_did,pos_id);
	for(key in population_genetic_info)
	{
		// if(key=='younger_left_max'||key=='growup_left_max')
		// {
		// 	child_role.role[key]=Math.floor((parent_role[key]+population_genetic_info[key].quality+population_genetic_info[key].difference)*0.5)
		// }
		// else
		// {
		// 	child_role.role[key]=Math.floor((parent_role[key]+population_genetic_info[key].quality+population_genetic_info[key].difference)*0.25);
		// }
		child_role.role[key]=Math.floor((parent_role[key]+population_genetic_info[key].quality+population_genetic_info[key].difference)*0.25);

	}

	child_role.role.blood_sugar=child_role.role.blood_sugar_max;
	child_role.role.younger_left=child_role.role.younger_left_max;
	child_role.role.growup_left=child_role.role.growup_left_max;

	// parent_role.blood_sugar=Math.floor(parent_role.blood_sugar*0.5);

	// console.log(child_role.role);
	// console.log(parent_role);
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

	if(building.building_did==3)//猴子
	{
		building.distance_from_home=maplib.get_nearist_home_distance(gameinfo,uid,pos_id);
	}
	else if(building.building_did==1)//树窝
	{

		for(building_id_t in gameinfo.buildings)
		{


			var building_t=gameinfo.buildings[building_id_t];


			if(building_t.uid==uid&&building_t.building_did==3)
			{

				building_t.distance_from_home=maplib.get_nearist_home_distance(gameinfo,uid,building_t.pos_id);
			}
		}
	}

	

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
		gameinfo.players[uid].map.meat[pos_id_t]=gameinfo.map.meat[pos_id_t];
	}
	return {
		building:building,
		sightzoon:sightzoon
	};
}


//此时
var gen_modefied_dic=function(gameinfo,uid,last_pos_dic)
{
	var modefied_dic={
		pos:{},
		add_roles:{},
		delete_roles:[],
		landform_map:{},
		resource_map:{},
		meat_map:{},
		add_buildings:{},
		delete_buildings:[]
	};

	//role变化字典
	modefied_dic.pos={};
	var insight_roles=maplib.get_role_ids_in_sightzoon_of_player(uid,gameinfo);
	for(i in insight_roles)
	{
		var role=gameinfo.roles[insight_roles[i]];
		modefied_dic.pos[role.role_id]=role.pos_id;
	}

	//新增role字典
	var add_roles={};
	for(role_id in modefied_dic.pos)
	{
		var role=gameinfo.roles[role_id];
		add_roles[role.role_id]=role;
	}
	//删除role字典  列表
	var delete_roles={};
	var delete_roles_list=[];
	// console.log(last_pos_dic)
	// console.log(delete_roles);
	for(role_id in last_pos_dic.pos)
	{
		// var role=gameinfo.roles[role_id];

		delete_roles[role_id]=role_id;
	}
	for(role_id in last_pos_dic.add_roles)
	{
		// var role=gameinfo.roles[role_id];

		delete_roles[role_id]=role_id;
	}
	// console.log(add_roles);
	// console.log(delete_roles);
	for(role_id in add_roles)
	{
		if(!!delete_roles[role_id])
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

	//因为角色属性在之后会变化，所以需要此时将属性复制出来
	modefied_dic.add_roles={};
	for(role_id_t in add_roles)
	{
		var role_t=add_roles[role_id_t];
		modefied_dic.add_roles[role_id_t]={};
		for(key in role_t)
		{
			modefied_dic.add_roles[role_id_t][key]=role_t[key];
			var direction_param=modefied_dic.add_roles[role_id_t].direction_param;
			modefied_dic.add_roles[role_id_t].direction_param=[]
			for(i in direction_param)
			{
				modefied_dic.add_roles[role_id_t].direction_param.push(direction_param[i]);
			}
			var skill_did_list=modefied_dic.add_roles[role_id_t].skill_did_list;
			modefied_dic.add_roles[role_id_t].skill_did_list=[]
			for(i in skill_did_list)
			{
				modefied_dic.add_roles[role_id_t].skill_did_list.push(skill_did_list[i]);
			}

		}
	}
	modefied_dic.delete_roles=delete_roles_list;

	//从pos字典中删除新增的角色
	for(role_id in add_roles)
	{
		delete modefied_dic.pos[role_id];
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
		modefied_dic.landform_map[zoon_id]=gameinfo.map.landform[zoon_id];
		modefied_dic.resource_map[zoon_id]=gameinfo.map.resource[zoon_id];
		modefied_dic.meat_map[zoon_id]=gameinfo.map.meat[zoon_id];

		gameinfo.players[uid].map.landform[zoon_id]=gameinfo.map.landform[zoon_id];
		gameinfo.players[uid].map.resource[zoon_id]=gameinfo.map.resource[zoon_id];
		gameinfo.players[uid].map.meat[zoon_id]=gameinfo.map.meat[zoon_id];
	}

	//building变化字典
	var buildings_modefied=maplib.get_buildings_modefied_of_player(uid,gameinfo);

	modefied_dic.add_buildings=buildings_modefied.add;
	for(building_id_t in buildings_modefied.add)
	{
		var building_t=buildings_modefied.add[building_id_t];
		modefied_dic.add_buildings[building_id_t]={};
		for(key in building_t)
		{
			modefied_dic.add_buildings[building_id_t][key]=building_t[key];


		}
	}
	modefied_dic.delete_buildings=buildings_modefied.delete;

	return modefied_dic;
}

exports.get_population_genetic_info=function(gameinfo,uid)
{
	// var population_genetic_quality_total=0;
	var quality_blood_sugar_max=0;
	var quality_fat=0;
	var quality_muscle=0;
	var quality_inteligent=0;
	var quality_amino_acid=0;
	var quality_breath=0;
	var quality_digest=0;
	var quality_courage=0;
	var quality_younger_left_max=0;
	var quality_growup_left_max=0;

	// var difference_total=0;
	var difference_blood_sugar_max=0;
	var difference_fat=0;
	var difference_muscle=0;
	var difference_inteligent=0;
	var difference_amino_acid=0;
	var difference_breath=0;
	var difference_digest=0;
	var difference_courage=0;
	var difference_younger_left_max=0;
	var difference_growup_left_max=0;

	var total_weight=0;

	var count=0;



	for(role_id in gameinfo.roles)
	{
		var role=gameinfo.roles[role_id];
		if(role.uid==uid&&role.younger_left==0)
		{
			quality_blood_sugar_max+=role.blood_sugar_max;
			quality_fat+=role.fat;
			quality_muscle+=role.muscle;
			quality_inteligent+=role.inteligent;
			quality_amino_acid+=role.amino_acid;
			quality_breath+=role.breath;
			quality_digest+=role.digest;
			quality_courage+=role.courage;
			quality_younger_left_max+=role.younger_left_max;
			quality_growup_left_max+=role.growup_left_max;

			count++;


		}
	}

	if(count>0)
	{
		quality_blood_sugar_max=Math.floor(quality_blood_sugar_max/count);
		quality_fat=Math.floor(quality_fat/count);
		quality_muscle=Math.floor(quality_muscle/count);
		quality_inteligent=Math.floor(quality_inteligent/count);
		quality_amino_acid=Math.floor(quality_amino_acid/count);
		quality_breath=Math.floor(quality_breath/count);
		quality_digest=Math.floor(quality_digest/count);
		quality_courage=Math.floor(quality_courage/count);
		quality_younger_left_max=Math.floor(quality_younger_left_max/count);
		quality_growup_left_max=Math.floor(quality_growup_left_max/count);


		for(role_id in gameinfo.roles)
		{
			var role=gameinfo.roles[role_id];
			if(role.uid==uid&&role.younger_left==0)
			{

				difference_blood_sugar_max=Math.pow(role.blood_sugar_max-quality_blood_sugar_max,2);
				difference_fat=Math.pow(role.fat-quality_fat,2);
				difference_muscle=Math.pow(role.muscle-quality_muscle,2);
				difference_inteligent=Math.pow(role.inteligent-quality_inteligent,2);
				difference_amino_acid=Math.pow(role.amino_acid-quality_amino_acid,2);
				difference_breath=Math.pow(role.breath-quality_breath,2);
				difference_digest=Math.pow(role.digest-quality_digest,2);
				difference_courage=Math.pow(role.courage-quality_courage,2);
				difference_younger_left_max=Math.pow(role.younger_left_max-quality_younger_left_max,2);
				difference_growup_left_max=Math.pow(role.growup_left_max-quality_growup_left_max,2);


			}
		}
		
		difference_blood_sugar_max=Math.floor(Math.pow(difference_blood_sugar_max/count,0.5));
		difference_fat=Math.floor(Math.pow(difference_fat/count,0.5));
		difference_muscle=Math.floor(Math.pow(difference_muscle/count,0.5));
		difference_inteligent=Math.floor(Math.pow(difference_inteligent/count,0.5));
		difference_amino_acid=Math.floor(Math.pow(difference_amino_acid/count,0.5));
		difference_breath=Math.floor(Math.pow(difference_breath/count,0.5));
		difference_digest=Math.floor(Math.pow(difference_digest/count,0.5));
		difference_courage=Math.floor(Math.pow(difference_courage/count,0.5));
		difference_younger_left_max=Math.floor(Math.pow(difference_younger_left_max/count,0.5));
		difference_growup_left_max=Math.floor(Math.pow(difference_growup_left_max/count,0.5));
	}
		

	return {
		blood_sugar_max:{
			quality:quality_blood_sugar_max,
			difference:difference_blood_sugar_max
		},
		fat:{
			quality:quality_fat,
			difference:difference_fat
		},
		muscle:{
			quality:quality_muscle,
			difference:difference_muscle
		},
		inteligent:{
			quality:quality_inteligent,
			difference:difference_inteligent
		},
		amino_acid:{
			quality:quality_amino_acid,
			difference:difference_amino_acid
		},
		breath:{
			quality:quality_breath,
			difference:difference_breath
		},
		digest:{
			quality:quality_digest,
			difference:difference_digest
		},
		courage:{
			quality:quality_courage,
			difference:difference_courage
		},
		younger_left_max:{
			quality:quality_younger_left_max,
			difference:difference_younger_left_max
		},
		growup_left_max:{
			quality:quality_growup_left_max,
			difference:difference_growup_left_max
		}
	}

	
}

exports.get_all_weight=function(gameinfo)
{
	var result={};
	for(uid in gameinfo.players)
	{
		result[uid]=0;
	}
		
	for(role_id in gameinfo.roles)
	{
		var role=gameinfo.roles[role_id];
		var role_all_property=rolelib.get_role_all_property(role_id,gameinfo);

		for(uid in gameinfo.players)
		{
			result[role.uid]+=role_all_property.weight;
		}
		
	}

	return result;
}

exports.get_group_weight=function(gameinfo)
{
	var all_weight=exports.get_all_weight(gameinfo);
	var group_weight={};
	for(uid in gameinfo.players)
	{
		var player=gameinfo.players[uid];
		if(player.group_id>0)
		{
			if(!group_weight[player.group_id])
			{
				group_weight[player.group_id]=0;
			}
		}
	}
	for(uid in all_weight)
	{
		var weight=all_weight[uid];
		var player=gameinfo.players[uid];
		group_weight[player.group_id]+=weight;
		
		
	}

	return group_weight;
}

exports.get_gameover=function(gameinfo)
{
	

	// var winner_groups=[];
	// var loser_groups=[];

	var all_weight=exports.get_all_weight(gameinfo);
	// var group_weight=exports.get_group_weight(gameinfo);
	


	switch(gameinfo.game.gametype_id)
	{
		case 1:
			// break;
		case 2:
			// for(group_id in group_weight)
			// {
			// 	var weight=group_weight[group_id];


			// 	if(weight>=1000)
			// 	{
			// 		winner_groups.push(group_id);
			// 	}
			// }
			// if(winner_groups.length>0)
			// {
			// 	for(group_id in group_weight)
			// 	{
			// 		if(!winner_groups.indexOf(group_id))
			// 		{
			// 			loser_groups.push(group_id);
			// 		}
					
			// 	}
				
			// }

			// for(group_id in group_weight)
			// {
			// 	var failed=true;
			// 	for(uid in gameinfo.players)
			// 	{
			// 		var player=gameinfo.players[uid];
			// 		if(player.group_id==group_id)
			// 		{
			// 			if(player.leave==false)
			// 			{
			// 				failed=false;
			// 				break;
			// 			}
			// 		}
			// 	}
			// 	if(failed)
			// 	{
			// 		loser_groups.push(group_id);
			// 	}
			// }
				
			// var temp_winner_groups_dic={};
			// for(group_id in group_weight)
			// {
			// 	temp_winner_groups_dic[group_id]=0;
			// }
			// for(i in loser_groups)
			// {
			// 	var group_id=loser_groups[i];
			// 	delete temp_winner_groups_dic[group_id];
			// }
			// if(Object.keys(temp_winner_groups_dic).length==1)
			// winner_groups.push(temp_winner_groups_dic[0]);
			var winners=[];
			var losers=[];

			for(uid in all_weight)
			{
				var weight=all_weight[uid];
				if(weight>=10)
				{
					winners.push(uid);
				}
			}
			if(winners.length>0)
			{
				for(uid in gameinfo.players)
				{
					if(winners.indexOf(uid)==-1)
					{
						losers.push(uid);
					}
				}
				return {
					result:{
						winners:winners,
						losers:losers,
					},
					all_weight:all_weight,
					gametype_id:gameinfo.game.gametype_id
				}
			}
			else
			{
				for(uid in gameinfo.players)
				{
					var player=gameinfo.players[uid];
					if(player.leave)
					{
						losers.push(uid);
					}
				}
				if(losers.length>0)
				{
					for(uid in gameinfo.players)
					{
						if(losers.indexOf(uid)==-1)
						{
							winners.push(uid);
						}
					}
					return {
						result:{
							winners:winners,
							losers:losers,
						},
							
						all_weight:all_weight,
						gametype_id:gameinfo.game.gametype_id
					}
				}

				else
				{
					return;
				}
					
					
			}
				
			
			break;
	}
				

		
}