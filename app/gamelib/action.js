var pomelo = require('pomelo');
var async=require('async');
var db=pomelo.app.get('db');

var logger = require('pomelo-logger').getLogger(__filename);


var get_base_landform_cost=function(landform,isriding)
{
	var result;
	if(isriding)
	{
		switch(landform)
		{
			case 1:
				result=2;
				break;
			case 2:
				result=15;
				break;
			case 3:
				result=10;
				break;
			case 4:
				result=20;
				break;
		}
	}
	else
	{
		switch(landform)
		{
			case 1:
				result=5;
				break;
			case 2:
				result=9;
				break;
			case 3:
				result=7;
				break;
			case 4:
				result=11;
				break;
		}
	}
	return result;
}


exports.getcost=function(src_landform,des_landform,load_weight,body_strenth,horse_strenth)
{
	var landform_cost;
	var strenth_cost;
	

	if(horse_strenth==0)
	{
		landform_cost=get_base_landform_cost(src_landform,false)+get_base_landform_cost(des_landform,false);
		strenth_cost=(load_weight+body_strenth)/body_strenth;
	}
	else
	{
		landform_cost=get_base_landform_cost(src_landform,true)+get_base_landform_cost(des_landform,true);	
		strenth_cost=(load_weight+body_strenth+horse_strenth)/horse_strenth;
	}

	

	return landform_cost*strenth_cost;
	
	
}
