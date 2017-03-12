// var skilllib=require('./skill');
var rolelib=require('./role');

var defaultDataManager=require('../defaultdata/defaultDataManager');



var neiboursSys=[
	[[1,1],[1,0],[0,-1],[-1,0],[-1,1],[0,1]],
	[[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[0,1]]
]

var sightSys=[
	{
		'1':[[1,1],[1,0],[0,-1],[-1,0],[-1,1],[0,1]],
		'2':[[2,1],[2,0],[2,-1],[1,-1],[0,-2],[-1,-1],[-2,-1],[-2,0],[-2,1],[-1,2],[0,2],[1,2]],
		'3':[[3,2],[3,1],[3,0],[3,-1],[2,-2],[1,-2],[0,-3],[-1,-2],[-2,-2],[-3,-1],[-3,0],[-3,1],[-3,2],[-2,2],[-1,3],[0,3],[1,3],[2,2]]
	},
	{
		'1':[[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[0,1]],
		'2':[[2,1],[2,0],[2,-1],[1,-2],[0,-2],[-1,-2],[-2,-1],[-2,0],[-2,1],[-1,1],[0,2],[1,1]],
		'3':[[3,1],[3,0],[3,-1],[3,-2],[2,-2],[1,-3],[0,-3],[1,-3],[-2,-2],[-3,-2],[-3,-1],[-3,0],[-3,1],[-2,2],[-1,2],[0,3],[1,2],[2,2]]
	}
]


//未做越界检查
var getid=function(width,x,y)
{
	return y*width+x;
}

var getxy=function(width,id)
{
	return {
		x:id%width,
		y:parseInt(id/width)
	}
}

//partid:从右上起，顺时针方向，为从0到5
// var getpart=function(centerx,centery,radius,partid)
// {
// 	var result=[];
// 	var neibours=neiboursSys[x&1];

// 	var tempx=centerx;
// 	var tempy=centery;
// 	for(var i=0;i<radius;i++)
// 	{
		

// 		for(var j=radius;j>0;j--)
// 		{
// 			//以partid作为lineid
// 			result.push(getlinexyinzoon(tempx,tempy,j,partid));
// 		}

// 		tempx+=neibours[(5+partid)%6][0];
// 		tempy+=neibours[(5+partid)%6][1];

// 		// switch(partid)
// 		// {
// 		// 	case 0:
// 		// 		result.push(getlinexyinzoon());
// 		// 		break;
// 		// }
// 	}
// 	return result;
// }

//lineid:从右上起，顺时针方向，为从0到5
// var getlinexyinzoon=function(centerx,centery,radius,lineid)
// {
// 	var result=[];
// 	var neibours=neiboursSys[x&1];

// 	for(var i=0;i<radius;i++)
// 	{
// 		if(i==0)
// 		{
// 			result.push({
// 				x:centerx,
// 				y:centery
// 			});
// 		}
// 		else
// 		{
// 			result.push({
// 				x:neibours[i][0],
// 				y:neibours[i][1]
// 			});
// 		}
		
// 	}
// 	return result;
// }

var getneibourxys=function(width,height,x,y)
{
	var neibours=neiboursSys[x&1];

	var neibourxys=[];
	for(i in neibours)
	{
		var xy=getxy(width,id);
		var xx=xy.x+neibours[i][0];
		var yy=xy.y+neibours[i][1];
		if(xx>=0&&xx<width&&yy>=0&&yy<height)
		{
			neibourxys.push({
				x:xx,
				y:yy
			});
		}
		
	}
	return neibourxys;
}

var getneibourids=function(width,height,id)
{
	var xy=getxy(width,id);

	var neibours=neiboursSys[xy.x&1];

	var neibourids=[];
	for(i in neibours)
	{
		var xx=xy.x+neibours[i][0];
		var yy=xy.y+neibours[i][1];

		if(xx>=0&&xx<width&&yy>=0&&yy<height)
		{
			neibourids.push(getid(width,xx,yy));
		}
	}
	return neibourids;
}

exports.get_neibour_ids=function(gameinfo,pos_id)
{
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);
	return getneibourids(gametype.width,gametype.height,pos_id);
}

var get_circle_ids=function(gameinfo,pos_id,circle_id)
{
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);
	var xy=getxy(gametype.width,pos_id);
	var circle_ids_dic=sightSys[xy.x&1];


	var result=[];
	for(i in circle_ids_dic[circle_id])
	{
		var xx=xy.x+circle_ids_dic[circle_id][i][0];
		var yy=xy.y+circle_ids_dic[circle_id][i][1];

		if(xx>=0&&xx<width&&yy>=0&&yy<height)
		{
			result.push(getid(width,xx,yy));
		}
	}
	return result;
}

var genshadowborderids=function(centerid,width,height,targetid,radius,includefirst)
{
	var center=getxy(width,centerid);
	var target=getxy(width,targetid);

	if(center.x>=0&&center.x<width&&center.y>=0&&center.y<height)
		return;

	var offsetx=target.x-center.x;
	var offsety=target.y-center.y;

	// var targetradius=radius-Math.abs(offsetx)-Math.abs(offsety);

	var shadowids=[];

	var neibours=neiboursSys[target.x&1];

	var tempx=target.x;
	var tempy=target.y;
	if(offsety>0&&offsetx==0)
	{
		for(var i=0;i<radius;i++)
		{
			tempx+=neibours[5][0];
			tempy+=neibours[5][1];
			if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				shadowids.push(getid(width,tempx,tempy));
		}
	}
	else if(offsety<0&&offsetx==0)
	{
		for(var i=0;i<radius;i++)
		{
			tempx+=neibours[2][0];
			tempy+=neibours[2][1];

			if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				shadowids.push(getid(width,tempx,tempy));
		}
	}
	else if(offsety==0&&offsetx>0&&target.x&1==0)
	{
		for(var i=0;i<radius;i++)
		{
			tempx+=neibours[1][0];
			tempy+=neibours[1][1];

			if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				shadowids.push(getid(width,tempx,tempy));
		}
	}
	else if(offsety==0&&offsetx>0&&target.x&1==1)
	{
		for(var i=0;i<radius;i++)
		{
			tempx+=neibours[0][0];
			tempy+=neibours[0][1];

			if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				shadowids.push(getid(width,tempx,tempy));
		}
	}
	else if(offsety==0&&offsetx<0&&target.x&1==0)
	{
		for(var i=0;i<radius;i++)
		{
			tempx+=neibours[3][0];
			tempy+=neibours[3][1];

			if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				shadowids.push(getid(width,tempx,tempy));
		}
	}
	else if(offsety==0&&offsetx<0&&target.x&1==1)
	{
		for(var i=0;i<radius;i++)
		{
			tempx+=neibours[4][0];
			tempy+=neibours[4][1];

			if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				shadowids.push(getid(width,tempx,tempy));
		}
	}



	if(offsety>0&&offsetx>0)
	{
		for(var i=0;i<radius;i++)
		{
			tempx+=neibours[5][0];
			tempy+=neibours[5][1];

			if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				shadowids.push(getid(width,tempx,tempy));
		}
		if(target.x&1==0)
		{
			for(var i=0;i<radius;i++)
			{
				tempx+=neibours[1][0];
				tempy+=neibours[1][1];

				if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
					shadowids.push(getid(width,tempx,tempy));
			}
		}
		else if(target.x&1==1)
		{
			for(var i=0;i<radius;i++)
			{
				tempx+=neibours[0][0];
				tempy+=neibours[0][1];

				if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
					shadowids.push(getid(width,tempx,tempy));
			}
		}
	}
	else if(offsety<0&&offsetx>0)
	{
		for(var i=0;i<radius;i++)
		{
			tempx+=neibours[2][0];
			tempy+=neibours[2][1];

			if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				shadowids.push(getid(width,tempx,tempy));
		}
		if(target.x&1==0)
		{
			for(var i=0;i<radius;i++)
			{
				tempx+=neibours[1][0];
				tempy+=neibours[1][1];

				if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
					shadowids.push(getid(width,tempx,tempy));
			}
		}
		else if(target.x&1==1)
		{
			for(var i=0;i<radius;i++)
			{
				tempx+=neibours[0][0];
				tempy+=neibours[0][1];

				if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
					shadowids.push(getid(width,tempx,tempy));
			}
		}
	}
	if(offsety<0&&offsetx<0)
	{
		for(var i=0;i<radius;i++)
		{
			tempx+=neibours[2][0];
			tempy+=neibours[2][1];

			if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				shadowids.push(getid(width,tempx,tempy));
		}
		if(target.x&1==0)
		{
			for(var i=0;i<radius;i++)
			{
				tempx+=neibours[3][0];
				tempy+=neibours[3][1];

				if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
					shadowids.push(getid(width,tempx,tempy));
			}
		}
		else if(target.x&1==1)
		{
			for(var i=0;i<radius;i++)
			{
				tempx+=neibours[4][0];
				tempy+=neibours[4][1];

				if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
					shadowids.push(getid(width,tempx,tempy));
			}
		}
	}
	else if(offsety>0&&offsetx<0)
	{
		for(var i=0;i<radius;i++)
		{
			tempx+=neibours[5][0];
			tempy+=neibours[5][1];

			if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				shadowids.push(getid(width,tempx,tempy));
		}
		if(target.x&1==0)
		{
			for(var i=0;i<radius;i++)
			{
				tempx+=neibours[3][0];
				tempy+=neibours[3][1];

				if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
					shadowids.push(getid(width,tempx,tempy));
			}
		}
		else if(target.x&1==1)
		{
			for(var i=0;i<radius;i++)
			{
				tempx+=neibours[4][0];
				tempy+=neibours[4][1];

				if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
					shadowids.push(getid(width,tempx,tempy));
			}
		}
	}

	if(includefirst)
	{
		shadowids.push(getid(width,target.x,target.y));
	}
}

var isinzoon=function(centerid,radius,targetid)
{

}

var getshadowidswithinzoon=function(centerid,width,height,sight,landform_map)
{
	var result=[];
	var temp=[];
	temp.unshift(centerid);
	for(var i=0;i<sight;i++)
	{
		var neibours=getneibourids(width,height,temp.pop());
		for(var j=0;j<neibours.length;j++)
		{

		}
	}
}

// var getsightzoon=function(centerx,centery,width,height,detectskilllv,landform_map)
// {
// 	var sightzoon=[];
// 	var shadows=[];

// 	var tempqueue=[];
// 	sightzoon.push({});


// 	switch(landform_map[getid(width,x,y)])
// 	{
// 		case 0:
// 			sightzoon=get
// 			break;
// 		case 1:
// 			break;
// 		default:
// 			break;
// 	}
// }

exports.getid=function(width,x,y)
{
	return getid(width,x,y);
}

exports.getxy=function(width,id)
{
	return getxy(width,id);
}

exports.getneibourids=function(width,height,id)
{
	return getneibourids(width,height,id);
}

exports.getneibourxys=function(width,height,x,y)
{
	return getneibourxys(width,height,x,y);
}


exports.getshadow=function(centerx,centery,barrierx,barriery,radius)
{

}

exports.checkpath=function(path,width,height)
{
	return true;
}





// var getbasesightzoon=function(centerid,sight,result,width,height)
// {
// 	checknodesrecursive(centerid,sight,result,width,height,0);
// }

// var checknodesrecursive=function(id,radius,accept,width,height,distence)
// {
// 	var neibourids=getneibourids(width,height,id);
// 	distence+=1;
// 	if(distence<=radius)
// 	{

// 		for(var i=0;i<neibourids.length;i++)
// 		{

// 			var visited=false;
// 			for(var j=0;j<accept.length;j++)
// 			{
// 				if(accept[j]==neibourids[i])
// 				{
// 					visited=true;
// 					break;
// 				}
// 			}
// 			if(visited==false)
// 			{
// 				accept.push(neibourids[i]);
// 			}
// 			checknodesrecursive(neibourids[i],radius,accept,width,height,distence);
// 		}
// 	}
// }

exports.getsightzoon_of_role=function(role_id,gameinfo)
{
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);


	var landform_map=gameinfo.map.landform;
	var resource_map=gameinfo.map.resource;

	var width=gametype.width;
	var height=gametype.height;

	var result=[];
	var role_all_property=rolelib.get_role_all_property(role_id,gameinfo);
	// var role=gameinfo.roles[role_id];

	var centerid=role_all_property.pos_id;
	
	
	var sightdistence=1;
	//拥有远眺技能，视野增加一格
	if(role_all_property.far_sight>0)
	{
		sightdistence++;
	}
	//站在山地上，视野增加一格
	if(landform_map[centerid]==2)
	{
		sightdistence++;
	}

	var have_detective_skill=role_all_property.see_through>0;

	var center=getxy(width,centerid);
	var sightSystem=sightSys[center.x&1];

	result.push(centerid);

	// console.log(sightdistence)

	//一环
	if(sightdistence>=1)
	{
		for(var i=0;i<sightSystem['1'].length;i++)
		{
			var x=center.x+sightSystem['1'][i][0];
			var y=center.y+sightSystem['1'][i][1];
			
			if(x<0||x>=width||y<0||y>=height)
			{
				continue;
			}
			var id=getid(width,x,y);
			
			// if(((landform_map[centerid]==2||landform_map[centerid]==4)&&(landform_map[id]==1||landform_map[id]==2))
			// ||((landform_map[centerid]==1||landform_map[centerid]==3)&&(landform_map[id]==1)))
			result.push(id);
		}
	}
	
	//二环
	if(sightdistence>=2)
	{

		for(var i=0;i<sightSystem['2'].length;i++)
		{
			var x=center.x+sightSystem['2'][i][0];
			var y=center.y+sightSystem['2'][i][1];
			if(x<0||x>=width||y<0||y>=height)
			{
				continue;
			}
			var id=getid(width,x,y);

			if(i==0||i==2||i==4||i==6||i==8||i==10)
			{
				var road;
				var tempx;
				var tempy;
				switch(i)
				{
					case 0:
						tempx=center.x+sightSystem['1'][0][0];
						tempy=center.y+sightSystem['1'][0][1];
						break;
					case 2:
						tempx=center.x+sightSystem['1'][1][0];
						tempy=center.y+sightSystem['1'][1][1];
						break;
					case 4:
						tempx=center.x+sightSystem['1'][2][0];
						tempy=center.y+sightSystem['1'][2][1];
						break;
					case 6:
						tempx=center.x+sightSystem['1'][3][0];
						tempy=center.y+sightSystem['1'][3][1];
						break;
					case 8:
						tempx=center.x+sightSystem['1'][4][0];
						tempy=center.y+sightSystem['1'][4][1];
						break;
					case 10:
						tempx=center.x+sightSystem['1'][5][0];
						tempy=center.y+sightSystem['1'][5][1];
						break;
				}
				if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				{
					if(landform_map[getid(width,tempx,tempy)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(resource_map[getid(width,tempx,tempy)]!=2&&resource_map[getid(width,tempx,tempy)]!=3)
							{
								road=true;
							}
							else
							{
								road=have_detective_skill;
							}
							
						}
						else
						{
							road=false;
						}
						
					}
					else if(landform_map[getid(width,tempx,tempy)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(resource_map[getid(width,tempx,tempy)]==2||resource_map[getid(width,tempx,tempy)]==3)
							{
								road=have_detective_skill;
							}
							else
							{
								road=true;
							}
						}
						else
						{
							road=true;
						}
					}
					else if(landform_map[getid(width,tempx,tempy)]==3)
					{
						road=false;
					}
					
				}
				else
				{
					road=false;
				}

				if(road)
				{
					result.push(id);
				}
			}
			else if(i==1||i==3||i==5||i==7||i==9||i==11)
			{
				var road1;
				var tempx1;
				var tempy1;
				var road2;
				var tempx2;
				var tempy2;

				switch(i)
				{
					case 1:
						tempx1=center.x+sightSystem['1'][0][0];
						tempy1=center.y+sightSystem['1'][0][1];
						tempx2=center.x+sightSystem['1'][1][0];
						tempy2=center.y+sightSystem['1'][1][1];
						break;
					case 3:
						tempx1=center.x+sightSystem['1'][1][0];
						tempy1=center.y+sightSystem['1'][1][1];
						tempx2=center.x+sightSystem['1'][2][0];
						tempy2=center.y+sightSystem['1'][2][1];
						break;
					case 5:
						tempx1=center.x+sightSystem['1'][2][0];
						tempy1=center.y+sightSystem['1'][2][1];
						tempx2=center.x+sightSystem['1'][3][0];
						tempy2=center.y+sightSystem['1'][3][1];
						break;
					case 7:
						tempx1=center.x+sightSystem['1'][3][0];
						tempy1=center.y+sightSystem['1'][3][1];
						tempx2=center.x+sightSystem['1'][4][0];
						tempy2=center.y+sightSystem['1'][4][1];
						break;
					case 9:
						tempx1=center.x+sightSystem['1'][4][0];
						tempy1=center.y+sightSystem['1'][4][1];
						tempx2=center.x+sightSystem['1'][5][0];
						tempy2=center.y+sightSystem['1'][5][1];
						break;
					case 11:
						tempx1=center.x+sightSystem['1'][5][0];
						tempy1=center.y+sightSystem['1'][5][1];
						tempx2=center.x+sightSystem['1'][0][0];
						tempy2=center.y+sightSystem['1'][0][1];
						break;
				}

				if(tempx1>=0&&tempx1<width&&tempy1>=0&&tempy1<height)
				{
					if(landform_map[getid(width,tempx1,tempy1)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(resource_map[getid(width,tempx1,tempy1)]!=2&&resource_map[getid(width,tempx1,tempy1)]!=3)
							{
								road1=true;
							}
							else
							{
								road1=have_detective_skill;
							}
							
						}
						else
						{
							road1=false;
						}
						
					}
					else if(landform_map[getid(width,tempx1,tempy1)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(resource_map[getid(width,tempx1,tempy1)]==2||resource_map[getid(width,tempx1,tempy1)]==3)
							{
								road1=have_detective_skill;
							}
							else
							{
								road1=true;
							}
						}
						else
						{
							road1=true;
						}
					}
					else if(landform_map[getid(width,tempx1,tempy1)]==3)
					{
						road1=false;
					}
					
				}
				else
				{
					road1=false;
				}

				if(tempx2>=0&&tempx2<width&&tempy2>=0&&tempy2<height)
				{
					if(landform_map[getid(width,tempx2,tempy2)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(resource_map[getid(width,tempx2,tempy2)]!=2&&resource_map[getid(width,tempx2,tempy2)]!=3)
							{
								road2=true;
							}
							else
							{
								road2=have_detective_skill;
							}
							
						}
						else
						{
							road2=false;
						}
						
					}
					else if(landform_map[getid(width,tempx2,tempy2)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(resource_map[getid(width,tempx2,tempy2)]==2||resource_map[getid(width,tempx2,tempy2)]==3)
							{
								road2=have_detective_skill;
							}
							else
							{
								road2=true;
							}
						}
						else
						{
							road2=true;
						}
					}
					else if(landform_map[getid(width,tempx2,tempy2)]==3)
					{
						road2=false;
					}
					
				}
				else
				{
					road2=false;
				}


				if(road1||road2)
				{
					result.push(id);
				}

			}
		}
	}
	//三环
	if(sightdistence>=3)
	{
		for(var i=0;i<sightSystem['3'].length;i++)
		{
			var x=center.x+sightSystem['3'][i][0];
			var y=center.y+sightSystem['3'][i][1];
			if(x<0||x>=width||y<0||y>=height)
			{
				continue;
			}
			var id=getid(width,x,y);


			if(i==0||i==3||i==6||i==9||i==12||i==15)
			{
				var road;
				var tempx11;
				var tempy11;
				var tempx21;
				var tempy21;

				switch(i)
				{
					case 0:
						tempx11=center.x+sightSystem['1'][0][0];
						tempy11=center.y+sightSystem['1'][0][1];
						tempx21=center.x+sightSystem['2'][0][0];
						tempy21=center.y+sightSystem['2'][0][1];
					case 3:
						tempx11=center.x+sightSystem['1'][1][0];
						tempy11=center.y+sightSystem['1'][1][1];
						tempx21=center.x+sightSystem['2'][2][0];
						tempy21=center.y+sightSystem['2'][2][1];
					case 6:
						tempx11=center.x+sightSystem['1'][2][0];
						tempy11=center.y+sightSystem['1'][2][1];
						tempx21=center.x+sightSystem['2'][4][0];
						tempy21=center.y+sightSystem['2'][4][1];
					case 9:
						tempx11=center.x+sightSystem['1'][3][0];
						tempy11=center.y+sightSystem['1'][3][1];
						tempx21=center.x+sightSystem['2'][6][0];
						tempy21=center.y+sightSystem['2'][6][1];
					case 12:
						tempx11=center.x+sightSystem['1'][4][0];
						tempy11=center.y+sightSystem['1'][4][1];
						tempx21=center.x+sightSystem['2'][8][0];
						tempy21=center.y+sightSystem['2'][8][1];
					case 15:
						tempx11=center.x+sightSystem['1'][5][0];
						tempy11=center.y+sightSystem['1'][5][1];
						tempx21=center.x+sightSystem['2'][10][0];
						tempy21=center.y+sightSystem['2'][10][1];
				}

				if(tempx11>=0&&tempx11<width&&tempy11>=0&&tempy11<height&&tempx21>=0&&tempx21<width&&tempy21>=0&&tempy21<height)
				{
					if(landform_map[getid(width,tempx11,tempy11)]==2||landform_map[getid(width,tempx21,tempy21)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(have_detective_skill==false)
							{
								road=true;
								if(landform_map[getid(width,tempx11,tempy11)]==2)
								{
									if(resource_map[getid(width,tempx11,tempy11)]==2)
									{
										road=false;
									}
								}
								if(landform_map[getid(width,tempx21,tempy21)]==2)
								{
									if(resource_map[getid(width,tempx21,tempy21)]==2)
									{
										road=false;
									}
								}
							}
							else
							{
								road=true;
							}
						}
						
						else
						{
							road=false;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==1&&landform_map[getid(width,tempx21,tempy21)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(have_detective_skill==false)
							{
								if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx21,tempy21)]==2)
								{
									road=false;
								}
								else
								{
									road=true;
								}
							}
							else
							{
								road=true;
							}
						}
						
						else
						{
							road=true;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==3||landform_map[getid(width,tempx21,tempy21)]==3)
					{
						road=false;
					}
					
				}
				else
				{
					road=false;
				}

				if(road)
				{
					result.push(id);
				}


			}

			else
			{
				var road1;
				var road2;
				var road3;
				var tempx11;
				var tempy11;
				var tempx21;
				var tempy21;
				var tempx12;
				var tempy12;
				var tempx22;
				var tempy22;

				switch(i)
				{
					case 1:
						tempx11=center.x+sightSystem['1'][0][0];
						tempy11=center.y+sightSystem['1'][0][1];
						tempx21=center.x+sightSystem['2'][0][0];
						tempy21=center.y+sightSystem['2'][0][1];
						tempx12=center.x+sightSystem['1'][1][0];
						tempy12=center.y+sightSystem['1'][1][1];
						tempx22=center.x+sightSystem['2'][1][0];
						tempy22=center.y+sightSystem['2'][1][1];
					case 2:
						tempx11=center.x+sightSystem['1'][0][0];
						tempy11=center.y+sightSystem['1'][0][1];
						tempx21=center.x+sightSystem['2'][1][0];
						tempy21=center.y+sightSystem['2'][1][1];
						tempx12=center.x+sightSystem['1'][1][0];
						tempy12=center.y+sightSystem['1'][1][1];
						tempx22=center.x+sightSystem['2'][2][0];
						tempy22=center.y+sightSystem['2'][2][1];
					case 4:
						tempx11=center.x+sightSystem['1'][1][0];
						tempy11=center.y+sightSystem['1'][1][1];
						tempx21=center.x+sightSystem['2'][2][0];
						tempy21=center.y+sightSystem['2'][2][1];
						tempx12=center.x+sightSystem['1'][2][0];
						tempy12=center.y+sightSystem['1'][2][1];
						tempx22=center.x+sightSystem['2'][3][0];
						tempy22=center.y+sightSystem['2'][3][1];
					case 5:
						tempx11=center.x+sightSystem['1'][1][0];
						tempy11=center.y+sightSystem['1'][1][1];
						tempx21=center.x+sightSystem['2'][3][0];
						tempy21=center.y+sightSystem['2'][3][1];
						tempx12=center.x+sightSystem['1'][2][0];
						tempy12=center.y+sightSystem['1'][2][1];
						tempx22=center.x+sightSystem['2'][4][0];
						tempy22=center.y+sightSystem['2'][4][1];
					case 7:
						tempx11=center.x+sightSystem['1'][2][0];
						tempy11=center.y+sightSystem['1'][2][1];
						tempx21=center.x+sightSystem['2'][4][0];
						tempy21=center.y+sightSystem['2'][4][1];
						tempx12=center.x+sightSystem['1'][3][0];
						tempy12=center.y+sightSystem['1'][3][1];
						tempx22=center.x+sightSystem['2'][5][0];
						tempy22=center.y+sightSystem['2'][5][1];
					case 8:
						tempx11=center.x+sightSystem['1'][2][0];
						tempy11=center.y+sightSystem['1'][2][1];
						tempx21=center.x+sightSystem['2'][5][0];
						tempy21=center.y+sightSystem['2'][5][1];
						tempx12=center.x+sightSystem['1'][3][0];
						tempy12=center.y+sightSystem['1'][3][1];
						tempx22=center.x+sightSystem['2'][6][0];
						tempy22=center.y+sightSystem['2'][6][1];
					case 10:
						tempx11=center.x+sightSystem['1'][3][0];
						tempy11=center.y+sightSystem['1'][3][1];
						tempx21=center.x+sightSystem['2'][6][0];
						tempy21=center.y+sightSystem['2'][6][1];
						tempx12=center.x+sightSystem['1'][4][0];
						tempy12=center.y+sightSystem['1'][4][1];
						tempx22=center.x+sightSystem['2'][7][0];
						tempy22=center.y+sightSystem['2'][7][1];
					case 11:
						tempx11=center.x+sightSystem['1'][3][0];
						tempy11=center.y+sightSystem['1'][3][1];
						tempx21=center.x+sightSystem['2'][7][0];
						tempy21=center.y+sightSystem['2'][7][1];
						tempx12=center.x+sightSystem['1'][4][0];
						tempy12=center.y+sightSystem['1'][4][1];
						tempx22=center.x+sightSystem['2'][8][0];
						tempy22=center.y+sightSystem['2'][8][1];
					case 13:
						tempx11=center.x+sightSystem['1'][4][0];
						tempy11=center.y+sightSystem['1'][4][1];
						tempx21=center.x+sightSystem['2'][8][0];
						tempy21=center.y+sightSystem['2'][8][1];
						tempx12=center.x+sightSystem['1'][5][0];
						tempy12=center.y+sightSystem['1'][5][1];
						tempx22=center.x+sightSystem['2'][9][0];
						tempy22=center.y+sightSystem['2'][9][1];
					case 14:
						tempx11=center.x+sightSystem['1'][4][0];
						tempy11=center.y+sightSystem['1'][4][1];
						tempx21=center.x+sightSystem['2'][9][0];
						tempy21=center.y+sightSystem['2'][9][1];
						tempx12=center.x+sightSystem['1'][5][0];
						tempy12=center.y+sightSystem['1'][5][1];
						tempx22=center.x+sightSystem['2'][10][0];
						tempy22=center.y+sightSystem['2'][10][1];
					case 16:
						tempx11=center.x+sightSystem['1'][5][0];
						tempy11=center.y+sightSystem['1'][5][1];
						tempx21=center.x+sightSystem['2'][10][0];
						tempy21=center.y+sightSystem['2'][10][1];
						tempx12=center.x+sightSystem['1'][0][0];
						tempy12=center.y+sightSystem['1'][0][1];
						tempx22=center.x+sightSystem['2'][11][0];
						tempy22=center.y+sightSystem['2'][11][1];
					case 17:
						tempx11=center.x+sightSystem['1'][5][0];
						tempy11=center.y+sightSystem['1'][5][1];
						tempx21=center.x+sightSystem['2'][11][0];
						tempy21=center.y+sightSystem['2'][11][1];
						tempx12=center.x+sightSystem['1'][0][0];
						tempy12=center.y+sightSystem['1'][0][1];
						tempx22=center.x+sightSystem['2'][0][0];
						tempy22=center.y+sightSystem['2'][0][1];
				}

				//road1
				if(tempx11>=0&&tempx11<width&&tempy11>=0&&tempy11<height&&tempx21>=0&&tempx21<width&&tempy21>=0&&tempy21<height)
				{
					if(landform_map[getid(width,tempx11,tempy11)]==2||landform_map[getid(width,tempx21,tempy21)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(have_detective_skill==false)
							{
								road1=true;
								if(landform_map[getid(width,tempx11,tempy11)]==2)
								{
									if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx11,tempy11)]==3)
									{
										road1=false;
									}
								}
								if(landform_map[getid(width,tempx21,tempy21)]==2)
								{
									if(resource_map[getid(width,tempx21,tempy21)]==2||resource_map[getid(width,tempx21,tempy21)]==3)
									{
										road1=false;
									}
								}
							}
							else
							{
								road1=true;
							}
						}
						
						else
						{
							road1=false;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==1&&landform_map[getid(width,tempx21,tempy21)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(have_detective_skill==false)
							{
								if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx21,tempy21)]==2||resource_map[getid(width,tempx11,tempy11)]==3||resource_map[getid(width,tempx21,tempy21)]==3)
								{
									road1=false;
								}
								else
								{
									road1=true;
								}
							}
							else
							{
								road1=true;
							}
						}
						
						else
						{
							road1=true;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==3||landform_map[getid(width,tempx21,tempy21)]==3)
					{
						road1=false;
					}
					
				}
				else
				{
					road1=false;
				}

				//road2
				if(tempx11>=0&&tempx11<width&&tempy11>=0&&tempy11<height&&tempx22>=0&&tempx22<width&&tempy22>=0&&tempy22<height)
				{
					if(landform_map[getid(width,tempx11,tempy11)]==2||landform_map[getid(width,tempx22,tempy22)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(have_detective_skill==false)
							{
								road2=true;
								if(landform_map[getid(width,tempx11,tempy11)]==2)
								{
									if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx11,tempy11)]==3)
									{
										road2=false;
									}
								}
								if(landform_map[getid(width,tempx22,tempy22)]==2)
								{
									if(resource_map[getid(width,tempx22,tempy22)]==2||resource_map[getid(width,tempx22,tempy22)]==3)
									{
										road2=false;
									}
								}
							}
							else
							{
								road2=true;
							}
						}
						
						else
						{
							road2=false;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==1&&landform_map[getid(width,tempx22,tempy22)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(have_detective_skill==false)
							{
								if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx22,tempy22)]==2||resource_map[getid(width,tempx11,tempy11)]==3||resource_map[getid(width,tempx22,tempy22)]==3)
								{
									road2=false;
								}
								else
								{
									road2=true;
								}
							}
							else
							{
								road2=true;
							}
						}
						
						else
						{
							road2=true;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==3||landform_map[getid(width,tempx22,tempy22)]==3)
					{
						road2=false;
					}
					
				}
				else
				{
					road2=false;
				}

				//road3
				if(tempx12>=0&&tempx12<width&&tempy12>=0&&tempy12<height&&tempx22>=0&&tempx22<width&&tempy22>=0&&tempy22<height)
				{
					if(landform_map[getid(width,tempx12,tempy12)]==2||landform_map[getid(width,tempx22,tempy22)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(have_detective_skill==false)
							{
								road3=true;
								if(landform_map[getid(width,tempx12,tempy12)]==2)
								{
									if(resource_map[getid(width,tempx12,tempy12)]==2||resource_map[getid(width,tempx12,tempy12)]==3)
									{
										road3=false;
									}
								}
								if(landform_map[getid(width,tempx22,tempy22)]==2)
								{
									if(resource_map[getid(width,tempx22,tempy22)]==2||resource_map[getid(width,tempx22,tempy22)]==3)
									{
										road3=false;
									}
								}
							}
							else
							{
								road3=true;
							}
						}
						
						else
						{
							road3=false;
						}
						
					}
					else if(landform_map[getid(width,tempx12,tempy12)]==1&&landform_map[getid(width,tempx22,tempy22)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(have_detective_skill==false)
							{
								if(resource_map[getid(width,tempx12,tempy12)]==2||resource_map[getid(width,tempx22,tempy22)]==2||resource_map[getid(width,tempx12,tempy12)]==3||resource_map[getid(width,tempx22,tempy22)]==3)
								{
									road3=false;
								}
								else
								{
									road3=true;
								}
							}
							else
							{
								road3=true;
							}
						}
						
						else
						{
							road3=true;
						}
						
					}
					else if(landform_map[getid(width,tempx12,tempy12)]==3||landform_map[getid(width,tempx22,tempy22)]==3)
					{

					}
					
				}
				else
				{
					road3=false;
				}

				if(road1||road2||road3)
				{
					result.push(id);
				}
			}
		}
	}


	return result;
}


exports.getsightzoon_of_building=function(building_id,gameinfo)
{
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);


	var landform_map=gameinfo.map.landform;
	var resource_map=gameinfo.map.resource;

	var width=gametype.width;
	var height=gametype.height;

	var result=[];

	var building=gameinfo.buildings[building_id];
	var centerid=building.pos_id;
	

	
	var sightdistence=1;
	//拥有远眺技能，视野增加一格
	if(building.far_sight>0)
	{
		sightdistence++;
	}
	//站在山地上，视野增加一格
	if(gameinfo.map.landform[centerid]==2)
	{
		sightdistence++;
	}

	var have_detective_skill=building.see_through>0;

	var center=getxy(width,centerid);
	var sightSystem=sightSys[center.x&1];

	result.push(centerid);


	//一环
	if(sightdistence>=1)
	{
		for(var i=0;i<sightSystem['1'].length;i++)
		{
			var x=center.x+sightSystem['1'][i][0];
			var y=center.y+sightSystem['1'][i][1];
			
			if(x<0||x>=width||y<0||y>=height)
			{
				continue;
			}
			var id=getid(width,x,y);
			
			// if(((landform_map[centerid]==2||landform_map[centerid]==4)&&(landform_map[id]==1||landform_map[id]==2))
			// ||((landform_map[centerid]==1||landform_map[centerid]==3)&&(landform_map[id]==1)))
			result.push(id);
		}
	}
	
	//二环
	if(sightdistence>=2)
	{

		for(var i=0;i<sightSystem['2'].length;i++)
		{
			var x=center.x+sightSystem['2'][i][0];
			var y=center.y+sightSystem['2'][i][1];
			if(x<0||x>=width||y<0||y>=height)
			{
				continue;
			}
			var id=getid(width,x,y);

			if(i==0||i==2||i==4||i==6||i==8||i==10)
			{
				var road;
				var tempx;
				var tempy;
				switch(i)
				{
					case 0:
						tempx=center.x+sightSystem['1'][0][0];
						tempy=center.y+sightSystem['1'][0][1];
						break;
					case 2:
						tempx=center.x+sightSystem['1'][1][0];
						tempy=center.y+sightSystem['1'][1][1];
						break;
					case 4:
						tempx=center.x+sightSystem['1'][2][0];
						tempy=center.y+sightSystem['1'][2][1];
						break;
					case 6:
						tempx=center.x+sightSystem['1'][3][0];
						tempy=center.y+sightSystem['1'][3][1];
						break;
					case 8:
						tempx=center.x+sightSystem['1'][4][0];
						tempy=center.y+sightSystem['1'][4][1];
						break;
					case 10:
						tempx=center.x+sightSystem['1'][5][0];
						tempy=center.y+sightSystem['1'][5][1];
						break;
				}
				if(tempx>=0&&tempx<width&&tempy>=0&&tempy<height)
				{
					if(landform_map[getid(width,tempx,tempy)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(resource_map[getid(width,tempx,tempy)]!=2&&resource_map[getid(width,tempx,tempy)]!=3)
							{
								road=true;
							}
							else
							{
								road=have_detective_skill;
							}
							
						}
						else
						{
							road=false;
						}
						
					}
					else if(landform_map[getid(width,tempx,tempy)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(resource_map[getid(width,tempx,tempy)]==2||resource_map[getid(width,tempx,tempy)]==3)
							{
								road=have_detective_skill;
							}
							else
							{
								road=true;
							}
						}
						else
						{
							road=true;
						}
					}
					else if(landform_map[getid(width,tempx,tempy)]==3)
					{
						road=false;
					}
					
				}
				else
				{
					road=false;
				}

				if(road)
				{
					result.push(id);
				}
			}
			else if(i==1||i==3||i==5||i==7||i==9||i==11)
			{
				var road1;
				var tempx1;
				var tempy1;
				var road2;
				var tempx2;
				var tempy2;

				switch(i)
				{
					case 1:
						tempx1=center.x+sightSystem['1'][0][0];
						tempy1=center.y+sightSystem['1'][0][1];
						tempx2=center.x+sightSystem['1'][1][0];
						tempy2=center.y+sightSystem['1'][1][1];
						break;
					case 3:
						tempx1=center.x+sightSystem['1'][1][0];
						tempy1=center.y+sightSystem['1'][1][1];
						tempx2=center.x+sightSystem['1'][2][0];
						tempy2=center.y+sightSystem['1'][2][1];
						break;
					case 5:
						tempx1=center.x+sightSystem['1'][2][0];
						tempy1=center.y+sightSystem['1'][2][1];
						tempx2=center.x+sightSystem['1'][3][0];
						tempy2=center.y+sightSystem['1'][3][1];
						break;
					case 7:
						tempx1=center.x+sightSystem['1'][3][0];
						tempy1=center.y+sightSystem['1'][3][1];
						tempx2=center.x+sightSystem['1'][4][0];
						tempy2=center.y+sightSystem['1'][4][1];
						break;
					case 9:
						tempx1=center.x+sightSystem['1'][4][0];
						tempy1=center.y+sightSystem['1'][4][1];
						tempx2=center.x+sightSystem['1'][5][0];
						tempy2=center.y+sightSystem['1'][5][1];
						break;
					case 11:
						tempx1=center.x+sightSystem['1'][5][0];
						tempy1=center.y+sightSystem['1'][5][1];
						tempx2=center.x+sightSystem['1'][0][0];
						tempy2=center.y+sightSystem['1'][0][1];
						break;
				}

				if(tempx1>=0&&tempx1<width&&tempy1>=0&&tempy1<height)
				{
					if(landform_map[getid(width,tempx1,tempy1)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(resource_map[getid(width,tempx1,tempy1)]!=2&&resource_map[getid(width,tempx1,tempy1)]!=3)
							{
								road1=true;
							}
							else
							{
								road1=have_detective_skill;
							}
							
						}
						else
						{
							road1=false;
						}
						
					}
					else if(landform_map[getid(width,tempx1,tempy1)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(resource_map[getid(width,tempx1,tempy1)]==2||resource_map[getid(width,tempx1,tempy1)]==3)
							{
								road1=have_detective_skill;
							}
							else
							{
								road1=true;
							}
						}
						else
						{
							road1=true;
						}
					}
					else if(landform_map[getid(width,tempx1,tempy1)]==3)
					{
						road1=false;
					}
					
				}
				else
				{
					road1=false;
				}

				if(tempx2>=0&&tempx2<width&&tempy2>=0&&tempy2<height)
				{
					if(landform_map[getid(width,tempx2,tempy2)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(resource_map[getid(width,tempx2,tempy2)]!=2&&resource_map[getid(width,tempx2,tempy2)]!=3)
							{
								road2=true;
							}
							else
							{
								road2=have_detective_skill;
							}
							
						}
						else
						{
							road2=false;
						}
						
					}
					else if(landform_map[getid(width,tempx2,tempy2)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(resource_map[getid(width,tempx2,tempy2)]==2||resource_map[getid(width,tempx2,tempy2)]==3)
							{
								road2=have_detective_skill;
							}
							else
							{
								road2=true;
							}
						}
						else
						{
							road2=true;
						}
					}
					else if(landform_map[getid(width,tempx2,tempy2)]==3)
					{
						road2=false;
					}
					
				}
				else
				{
					road2=false;
				}


				if(road1||road2)
				{
					result.push(id);
				}

			}
		}
	}
	//三环
	if(sightdistence>=3)
	{
		for(var i=0;i<sightSystem['3'].length;i++)
		{
			var x=center.x+sightSystem['3'][i][0];
			var y=center.y+sightSystem['3'][i][1];
			if(x<0||x>=width||y<0||y>=height)
			{
				continue;
			}
			var id=getid(width,x,y);


			if(i==0||i==3||i==6||i==9||i==12||i==15)
			{
				var road;
				var tempx11;
				var tempy11;
				var tempx21;
				var tempy21;

				switch(i)
				{
					case 0:
						tempx11=center.x+sightSystem['1'][0][0];
						tempy11=center.y+sightSystem['1'][0][1];
						tempx21=center.x+sightSystem['2'][0][0];
						tempy21=center.y+sightSystem['2'][0][1];
					case 3:
						tempx11=center.x+sightSystem['1'][1][0];
						tempy11=center.y+sightSystem['1'][1][1];
						tempx21=center.x+sightSystem['2'][2][0];
						tempy21=center.y+sightSystem['2'][2][1];
					case 6:
						tempx11=center.x+sightSystem['1'][2][0];
						tempy11=center.y+sightSystem['1'][2][1];
						tempx21=center.x+sightSystem['2'][4][0];
						tempy21=center.y+sightSystem['2'][4][1];
					case 9:
						tempx11=center.x+sightSystem['1'][3][0];
						tempy11=center.y+sightSystem['1'][3][1];
						tempx21=center.x+sightSystem['2'][6][0];
						tempy21=center.y+sightSystem['2'][6][1];
					case 12:
						tempx11=center.x+sightSystem['1'][4][0];
						tempy11=center.y+sightSystem['1'][4][1];
						tempx21=center.x+sightSystem['2'][8][0];
						tempy21=center.y+sightSystem['2'][8][1];
					case 15:
						tempx11=center.x+sightSystem['1'][5][0];
						tempy11=center.y+sightSystem['1'][5][1];
						tempx21=center.x+sightSystem['2'][10][0];
						tempy21=center.y+sightSystem['2'][10][1];
				}

				if(tempx11>=0&&tempx11<width&&tempy11>=0&&tempy11<height&&tempx21>=0&&tempx21<width&&tempy21>=0&&tempy21<height)
				{
					if(landform_map[getid(width,tempx11,tempy11)]==2||landform_map[getid(width,tempx21,tempy21)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(have_detective_skill==false)
							{
								road=true;
								if(landform_map[getid(width,tempx11,tempy11)]==2)
								{
									if(resource_map[getid(width,tempx11,tempy11)]==2)
									{
										road=false;
									}
								}
								if(landform_map[getid(width,tempx21,tempy21)]==2)
								{
									if(resource_map[getid(width,tempx21,tempy21)]==2)
									{
										road=false;
									}
								}
							}
							else
							{
								road=true;
							}
						}
						
						else
						{
							road=false;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==1&&landform_map[getid(width,tempx21,tempy21)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(have_detective_skill==false)
							{
								if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx21,tempy21)]==2)
								{
									road=false;
								}
								else
								{
									road=true;
								}
							}
							else
							{
								road=true;
							}
						}
						
						else
						{
							road=true;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==3||landform_map[getid(width,tempx21,tempy21)]==3)
					{
						road=false;
					}
					
				}
				else
				{
					road=false;
				}

				if(road)
				{
					result.push(id);
				}


			}

			else
			{
				var road1;
				var road2;
				var road3;
				var tempx11;
				var tempy11;
				var tempx21;
				var tempy21;
				var tempx12;
				var tempy12;
				var tempx22;
				var tempy22;

				switch(i)
				{
					case 1:
						tempx11=center.x+sightSystem['1'][0][0];
						tempy11=center.y+sightSystem['1'][0][1];
						tempx21=center.x+sightSystem['2'][0][0];
						tempy21=center.y+sightSystem['2'][0][1];
						tempx12=center.x+sightSystem['1'][1][0];
						tempy12=center.y+sightSystem['1'][1][1];
						tempx22=center.x+sightSystem['2'][1][0];
						tempy22=center.y+sightSystem['2'][1][1];
					case 2:
						tempx11=center.x+sightSystem['1'][0][0];
						tempy11=center.y+sightSystem['1'][0][1];
						tempx21=center.x+sightSystem['2'][1][0];
						tempy21=center.y+sightSystem['2'][1][1];
						tempx12=center.x+sightSystem['1'][1][0];
						tempy12=center.y+sightSystem['1'][1][1];
						tempx22=center.x+sightSystem['2'][2][0];
						tempy22=center.y+sightSystem['2'][2][1];
					case 4:
						tempx11=center.x+sightSystem['1'][1][0];
						tempy11=center.y+sightSystem['1'][1][1];
						tempx21=center.x+sightSystem['2'][2][0];
						tempy21=center.y+sightSystem['2'][2][1];
						tempx12=center.x+sightSystem['1'][2][0];
						tempy12=center.y+sightSystem['1'][2][1];
						tempx22=center.x+sightSystem['2'][3][0];
						tempy22=center.y+sightSystem['2'][3][1];
					case 5:
						tempx11=center.x+sightSystem['1'][1][0];
						tempy11=center.y+sightSystem['1'][1][1];
						tempx21=center.x+sightSystem['2'][3][0];
						tempy21=center.y+sightSystem['2'][3][1];
						tempx12=center.x+sightSystem['1'][2][0];
						tempy12=center.y+sightSystem['1'][2][1];
						tempx22=center.x+sightSystem['2'][4][0];
						tempy22=center.y+sightSystem['2'][4][1];
					case 7:
						tempx11=center.x+sightSystem['1'][2][0];
						tempy11=center.y+sightSystem['1'][2][1];
						tempx21=center.x+sightSystem['2'][4][0];
						tempy21=center.y+sightSystem['2'][4][1];
						tempx12=center.x+sightSystem['1'][3][0];
						tempy12=center.y+sightSystem['1'][3][1];
						tempx22=center.x+sightSystem['2'][5][0];
						tempy22=center.y+sightSystem['2'][5][1];
					case 8:
						tempx11=center.x+sightSystem['1'][2][0];
						tempy11=center.y+sightSystem['1'][2][1];
						tempx21=center.x+sightSystem['2'][5][0];
						tempy21=center.y+sightSystem['2'][5][1];
						tempx12=center.x+sightSystem['1'][3][0];
						tempy12=center.y+sightSystem['1'][3][1];
						tempx22=center.x+sightSystem['2'][6][0];
						tempy22=center.y+sightSystem['2'][6][1];
					case 10:
						tempx11=center.x+sightSystem['1'][3][0];
						tempy11=center.y+sightSystem['1'][3][1];
						tempx21=center.x+sightSystem['2'][6][0];
						tempy21=center.y+sightSystem['2'][6][1];
						tempx12=center.x+sightSystem['1'][4][0];
						tempy12=center.y+sightSystem['1'][4][1];
						tempx22=center.x+sightSystem['2'][7][0];
						tempy22=center.y+sightSystem['2'][7][1];
					case 11:
						tempx11=center.x+sightSystem['1'][3][0];
						tempy11=center.y+sightSystem['1'][3][1];
						tempx21=center.x+sightSystem['2'][7][0];
						tempy21=center.y+sightSystem['2'][7][1];
						tempx12=center.x+sightSystem['1'][4][0];
						tempy12=center.y+sightSystem['1'][4][1];
						tempx22=center.x+sightSystem['2'][8][0];
						tempy22=center.y+sightSystem['2'][8][1];
					case 13:
						tempx11=center.x+sightSystem['1'][4][0];
						tempy11=center.y+sightSystem['1'][4][1];
						tempx21=center.x+sightSystem['2'][8][0];
						tempy21=center.y+sightSystem['2'][8][1];
						tempx12=center.x+sightSystem['1'][5][0];
						tempy12=center.y+sightSystem['1'][5][1];
						tempx22=center.x+sightSystem['2'][9][0];
						tempy22=center.y+sightSystem['2'][9][1];
					case 14:
						tempx11=center.x+sightSystem['1'][4][0];
						tempy11=center.y+sightSystem['1'][4][1];
						tempx21=center.x+sightSystem['2'][9][0];
						tempy21=center.y+sightSystem['2'][9][1];
						tempx12=center.x+sightSystem['1'][5][0];
						tempy12=center.y+sightSystem['1'][5][1];
						tempx22=center.x+sightSystem['2'][10][0];
						tempy22=center.y+sightSystem['2'][10][1];
					case 16:
						tempx11=center.x+sightSystem['1'][5][0];
						tempy11=center.y+sightSystem['1'][5][1];
						tempx21=center.x+sightSystem['2'][10][0];
						tempy21=center.y+sightSystem['2'][10][1];
						tempx12=center.x+sightSystem['1'][0][0];
						tempy12=center.y+sightSystem['1'][0][1];
						tempx22=center.x+sightSystem['2'][11][0];
						tempy22=center.y+sightSystem['2'][11][1];
					case 17:
						tempx11=center.x+sightSystem['1'][5][0];
						tempy11=center.y+sightSystem['1'][5][1];
						tempx21=center.x+sightSystem['2'][11][0];
						tempy21=center.y+sightSystem['2'][11][1];
						tempx12=center.x+sightSystem['1'][0][0];
						tempy12=center.y+sightSystem['1'][0][1];
						tempx22=center.x+sightSystem['2'][0][0];
						tempy22=center.y+sightSystem['2'][0][1];
				}

				//road1
				if(tempx11>=0&&tempx11<width&&tempy11>=0&&tempy11<height&&tempx21>=0&&tempx21<width&&tempy21>=0&&tempy21<height)
				{
					if(landform_map[getid(width,tempx11,tempy11)]==2||landform_map[getid(width,tempx21,tempy21)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(have_detective_skill==false)
							{
								road1=true;
								if(landform_map[getid(width,tempx11,tempy11)]==2)
								{
									if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx11,tempy11)]==3)
									{
										road1=false;
									}
								}
								if(landform_map[getid(width,tempx21,tempy21)]==2)
								{
									if(resource_map[getid(width,tempx21,tempy21)]==2||resource_map[getid(width,tempx21,tempy21)]==3)
									{
										road1=false;
									}
								}
							}
							else
							{
								road1=true;
							}
						}
						
						else
						{
							road1=false;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==1&&landform_map[getid(width,tempx21,tempy21)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(have_detective_skill==false)
							{
								if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx21,tempy21)]==2||resource_map[getid(width,tempx11,tempy11)]==3||resource_map[getid(width,tempx21,tempy21)]==3)
								{
									road1=false;
								}
								else
								{
									road1=true;
								}
							}
							else
							{
								road1=true;
							}
						}
						
						else
						{
							road1=true;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==3||landform_map[getid(width,tempx21,tempy21)]==3)
					{
						road1=false;
					}
					
				}
				else
				{
					road1=false;
				}

				//road2
				if(tempx11>=0&&tempx11<width&&tempy11>=0&&tempy11<height&&tempx22>=0&&tempx22<width&&tempy22>=0&&tempy22<height)
				{
					if(landform_map[getid(width,tempx11,tempy11)]==2||landform_map[getid(width,tempx22,tempy22)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(have_detective_skill==false)
							{
								road2=true;
								if(landform_map[getid(width,tempx11,tempy11)]==2)
								{
									if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx11,tempy11)]==3)
									{
										road2=false;
									}
								}
								if(landform_map[getid(width,tempx22,tempy22)]==2)
								{
									if(resource_map[getid(width,tempx22,tempy22)]==2||resource_map[getid(width,tempx22,tempy22)]==3)
									{
										road2=false;
									}
								}
							}
							else
							{
								road2=true;
							}
						}
						
						else
						{
							road2=false;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==1&&landform_map[getid(width,tempx22,tempy22)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(have_detective_skill==false)
							{
								if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx22,tempy22)]==2||resource_map[getid(width,tempx11,tempy11)]==3||resource_map[getid(width,tempx22,tempy22)]==3)
								{
									road2=false;
								}
								else
								{
									road2=true;
								}
							}
							else
							{
								road2=true;
							}
						}
						
						else
						{
							road2=true;
						}
						
					}
					else if(landform_map[getid(width,tempx11,tempy11)]==3||landform_map[getid(width,tempx22,tempy22)]==3)
					{
						road2=false;
					}
					
				}
				else
				{
					road2=false;
				}

				//road3
				if(tempx12>=0&&tempx12<width&&tempy12>=0&&tempy12<height&&tempx22>=0&&tempx22<width&&tempy22>=0&&tempy22<height)
				{
					if(landform_map[getid(width,tempx12,tempy12)]==2||landform_map[getid(width,tempx22,tempy22)]==2)
					{
						if(landform_map[centerid]==2&&(landform_map[id]==2||landform_map[id]==3))
						{
							if(have_detective_skill==false)
							{
								road3=true;
								if(landform_map[getid(width,tempx12,tempy12)]==2)
								{
									if(resource_map[getid(width,tempx12,tempy12)]==2||resource_map[getid(width,tempx12,tempy12)]==3)
									{
										road3=false;
									}
								}
								if(landform_map[getid(width,tempx22,tempy22)]==2)
								{
									if(resource_map[getid(width,tempx22,tempy22)]==2||resource_map[getid(width,tempx22,tempy22)]==3)
									{
										road3=false;
									}
								}
							}
							else
							{
								road3=true;
							}
						}
						
						else
						{
							road3=false;
						}
						
					}
					else if(landform_map[getid(width,tempx12,tempy12)]==1&&landform_map[getid(width,tempx22,tempy22)]==1)
					{
						if(landform_map[centerid]==1&&landform_map[id]==1)
						{
							if(have_detective_skill==false)
							{
								if(resource_map[getid(width,tempx12,tempy12)]==2||resource_map[getid(width,tempx22,tempy22)]==2||resource_map[getid(width,tempx12,tempy12)]==3||resource_map[getid(width,tempx22,tempy22)]==3)
								{
									road3=false;
								}
								else
								{
									road3=true;
								}
							}
							else
							{
								road3=true;
							}
						}
						
						else
						{
							road3=true;
						}
						
					}
					else if(landform_map[getid(width,tempx12,tempy12)]==3||landform_map[getid(width,tempx22,tempy22)]==3)
					{

					}
					
				}
				else
				{
					road3=false;
				}

				if(road1||road2||road3)
				{
					result.push(id);
				}
			}
		}
	}


	return result;
}







exports.getsightzoon_of_player=function(uid,gameinfo)//game_total_role,game_total_map,gametype)
{
	var landform_map=gameinfo.map.landform;
	var resource_map=gameinfo.map.resource;
	var sightzoon=[];
	var role;
	var temp_zoon;
	for(role_id in gameinfo.roles)
	{

		role=gameinfo.roles[role_id];
		if(role.uid==uid)
		{
			temp_zoon=exports.getsightzoon_of_role(role_id,gameinfo)//_total_role,game_total_map,gametype);
			// console.log(temp_zoon);
			for(i in temp_zoon)
			{
				if(sightzoon.indexOf(temp_zoon[i])==-1)
				{
					sightzoon.push(temp_zoon[i]);
				}
			}
		}
	}

	for(building_id in gameinfo.buildings)
	{
		building=gameinfo.buildings[building_id];
		if(role.uid==uid)
		{
			temp_zoon=exports.getsightzoon_of_building(building_id,gameinfo)//_total_role,game_total_map,gametype);
			// console.log(temp_zoon);
			for(i in temp_zoon)
			{
				if(sightzoon.indexOf(temp_zoon[i])==-1)
				{
					sightzoon.push(temp_zoon[i]);
				}
			}
		}
	}

	return sightzoon;
}

exports.get_roles_in_sightzoon_of_player=function(uid,gameinfo)//game_total_role,game_total_map,gametype)
{
	var landform_map=gameinfo.map.landform;
	var resource_map=gameinfo.map.resource;

	var roles={};
	var sightzoon=exports.getsightzoon_of_player(uid,gameinfo)//game_total_role,game_total_map,gametype);
	// console.log(sightzoon)
	for(role_id in gameinfo.roles)
	{
		var role=gameinfo.roles[role_id];
		if(sightzoon.indexOf(role.pos_id)!=-1)
		{
			if(resource_map[role.pos_id]==3)
			{
				var role_all_property=rolelib.get_role_all_property(role_id,gameinfo);
				if(role_all_property.hide==0)
				{
					roles[role.role_id]=role;
				}
				else if(gameinfo.player[uid].group_id==gameinfo.player[role.uid].group_id)
				{
					roles[role.role_id]=role;
				}
				else
				{
					var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);
					var neibourids=getneibourids(gametype.width,gametype.height,role.pos_id);
					var saw=false;
					for(role_id_t in gameinfo.roles)
					{
						var role_t=gameinfo.roles[role_id_t];
						if(neibourids.indexOf(role_t.pos_id))
						{
							saw=true;
							break;
						}
					}
					if(saw)
					{
						roles[role.role_id]=role;
					}
				}
			}
			else
			{
				roles[role.role_id]=role;
			}
		}
		
	}

	return roles;
}

// exports.get_role_ids_in_sightzoon_of_player=function(uid,gameinfo)//game_total_role,game_total_map,gametype)
// {
// 	var landform_map=gameinfo.map.landform;
// 	var resource_map=gameinfo.map.resource;

	
// 	var role_ids=[];
// 	var sightzoon=exports.getsightzoon_of_player(uid,gameinfo)//game_total_role,game_total_map,gametype);

// 	for(role_id in gameinfo.roles)
// 	{
// 		var role=gameinfo.roles[role_id];
// 		if(sightzoon.indexOf(role.pos_id)!=-1)
// 		{
// 			role_ids.push(role.role_id);
// 		}
		
// 	}

// 	return role_ids;
// }

// exports.get_buildings_of_player=function(uid,gameinfo)
// {
// 	var landform_map=gameinfo.map.landform;
// 	var resource_map=gameinfo.map.resource;

// 	var buildings={};

// 	for(building_id in gameinfo.buildings)
// 	{
// 		var building=gameinfo.buildings[building_id];
// 		var detected=gameinfo.players[uid].map[building.pos_id];
// 		if(detected==1)
// 		{
// 			buildings[building.building_id]=building;
// 		}
		
// 	}
// 	return buildings;
// }

// exports.get_buildings_in_sightzoon_of_player=function(uid,gameinfo)
// {
// 	var landform_map=gameinfo.map.landform;
// 	var resource_map=gameinfo.map.resource;

// 	var buildings={};
// 	var sightzoon=exports.getsightzoon_of_player(uid,gameinfo);
// 	for(building_id in gameinfo.buildings)
// 	{
// 		var building=gameinfo.buildings[building_id];
// 		if(sightzoon.indexOf(building.pos_id)!=-1)
// 		{
// 			buildings[building.building_id]=building;
// 		}
		
// 	}
// 	return buildings;
// }

//只算增删改动，不算building属性的改动,并将改动写入user_building数据中
exports.get_buildings_modefied_of_player=function(uid,gameinfo)
{
	var landform_map=gameinfo.map.landform;
	var resource_map=gameinfo.map.resource;

	var sightzoon=exports.getsightzoon_of_player(uid,gameinfo);
	
	var buildings={};
	for(building_id in gameinfo.buildings)
	{
		var building=gameinfo.buildings[building_id];
		if(sightzoon.indexOf(building.pos_id)!=-1)
		{
			buildings[building.building_id]=building;
		}
		
	}

	var user_buildings={};
	for(building_id in gameinfo.players[uid].buildings)
	{
		var building=gameinfo.players[uid].buildings[building_id];
		if(sightzoon.indexOf(building.pos_id)!=-1)
		{
			user_buildings[building.building_id]=building;
		}
		else if(building.hide_when_outsight==1)
		{
			user_buildings[building.building_id]=building;
		}
		
	}

	// console.log(buildings)
	// console.log(user_buildings)

	for(building_id in buildings)
	{
		var building=gameinfo.buildings[building_id];
		for(user_building_id in user_buildings)
		{
			var user_building=user_buildings[user_building_id];

			if(building.building_id==user_building.building_id)
			{
				delete buildings[building_id];
				delete user_buildings[user_building_id];
			}
		}
	}

	var delete_buildings=[]
	for(user_building_id in user_buildings)
	{
		var user_building=user_buildings[user_building_id];
		delete_buildings.push(user_building.building_id);
	}

	for(building_id in buildings)
	{
		gameinfo.players[uid].buildings[building_id]=buildings[building_id];
	}
	for(building_id in user_buildings)
	{
		delete gameinfo.players[uid].buildings[building_id];
	}

	return {
		add:buildings,
		delete:delete_buildings
	};

}


exports.get_pos_movable=function(pos_id,gameinfo)
{
	var movable=true;
	for(role_id in gameinfo.roles)
	{
		var role=gameinfo.roles[role_id];
		// var role_all_property=rolelib.get_role_all_property(role_id,game_total_role);
		if(role.pos_id==pos_id)
		{
			movable=false;
			break;
		}
		
	}
	return movable;
}

//只是修改数据，不做合理性检测
exports.do_role_move=function(role_id,source_pos_id,next_pos_id,gameinfo)//game_total_role,game_total_map,game_user_map,gametype)
{
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);
	var landform_source=defaultDataManager.get_d_landform(gameinfo.map.landform[source_pos_id]);
	var landform_next=defaultDataManager.get_d_landform(gameinfo.map.landform[next_pos_id]);
	var cost=landform_source.cost+landform_next.cost;

	var role=gameinfo.roles[role_id];
	if(role.move>=cost&&landform_next.cost>0)
	{
		role.pos_id=next_pos_id;
		role.move-=cost;
		var sightzoon=exports.getsightzoon_of_role(role_id,gameinfo)//game_total_role,game_total_map,gametype);
		for(id in sightzoon)
		{
			var pos_id_t=sightzoon[id];
			// gameinfo.players[gameinfo.roles[role_id].uid].map[pos_id_t]=1;
			gameinfo.players[gameinfo.roles[role_id].uid].map.landform[pos_id_t]=gameinfo.map.landform[pos_id_t];
			gameinfo.players[gameinfo.roles[role_id].uid].map.resource[pos_id_t]=gameinfo.map.resource[pos_id_t];
		}
		return true;
	}
	else
	{
		return false;
	}


	
	
	// var sightzoon=exports.getsightzoon_of_player(game_total_role[role_id].uid,game_total_role,game_total_map,gametype);
	// for(id in sightzoon)
	// {
	// 	var pos_id_t=sightzoon[id];
	// }
	
}



exports.get_enemy=function(role_id,gameinfo)//game_total_role,game_total_player,gametype)
{
	// console.log(role_id)
	// console.log(gameinfo)
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);
	var role=gameinfo.roles[role_id];

	var roles_in_sightzoon=exports.get_roles_in_sightzoon_of_player(role_id,gameinfo);
	var circle_ids_one=get_circle_ids(gameinfo,role.pos_id,1);
	var circle_ids_two=get_circle_ids(gameinfo,role.pos_id,2);

	var enemy={
		type:0,//0无 1贴身 2远程
		role:null
	}

	var enemies={
		type:0,//0无 1贴身 2远程
		roles:[[],[]]
	}

	for(role_id_t in roles_in_sightzoon)
	{
		var role_t=gameinfo.roles[role_id_t];
		if(gameinfo.players[role_t.uid].group_id=gameinfo.players[role.uid].group_id)
		{
			delete roles_in_sightzoon[role_id_t];
		}
	}

	for(role_id_t in roles_in_sightzoon)
	{
		var role_t=gameinfo.roles[role_id_t];
		if(circle_ids_one.indexOf(role_t.pos_id)!=-1)
		{
			enemies.type=1;
			if(role_t.taunt==1)
			{
				enemies.roles[0].push(role_t);
			}
			else
			{
				enemies.roles[1].push(role_t);
			}
			
		}
	}

	if(enemies.type==0)
	{
		for(role_id_t in roles_in_sightzoon)
		{
			var role_t=gameinfo.roles[role_id_t];
			if(circle_ids_two.indexOf(role_t.pos_id)!=-1)
			{
				enemies.type=2;
				if(role_t.taunt==1)
				{
					enemies.roles[0].push(role_t);
				}
				else
				{
					enemies.roles[1].push(role_t);
				}
			}
		}
	}

	for(i in enemies.roles)
	{
		if(enemies.roles.length>0)
		{
			enemy.type=i+1;
			enemy.role=enemies.roles[Math.floor(Math.random()*enemies.roles.length)];
			break;
		}
	}


	// var neibourids=getneibourids(gametype.width,gametype.height,role.pos_id);
	// var enemies={};

	// for(role_id_t in gameinfo.roles)
	// {
	// 	var role_t=gameinfo.roles[role_id_t];
	// 	if(neibourids.indexOf(role_t.pos_id)!=-1)
	// 	{
	// 		if(gameinfo.players[role_t.uid].group_id!=gameinfo.players[role.uid].group_id)
	// 		{
	// 			enemies[role_id_t]=role_t;
	// 		}
	// 	}
		
	// }

	return enemy;
}

//role中应该已经添加了first_p和secend_p两个临时变量
exports.fill_retreat_spot=function(role_id,enemies,gameinfo)//game_total_role,gametype)
{
	var gametype=defaultDataManager.get_d_gametype(gameinfo.game.gametype_id);
	var role=gameinfo.roles[role_id];
	var neibourids=getneibourids(gametype.width,gametype.height,role.pos_id);

	for(enemy_id in enemies)
	{
		var enemy=enemies[enemy_id];
		var relation;
		for(i in neibourids)
		{
			var neibourid=neibourids[i];
			if(neibourid==enemy.pos_id)
			{
				relation=parseInt(i);
				break;
			}
		}
		var first_spot=neibourids[(relation+3)%6];
		role.first_p.push(first_spot);
		var secend_spot=neibourids[(relation+2)%6];
		if(role.secend_p.indexOf(secend_spot)==-1)
		{
			role.secend_p.push(secend_spot);
		}
		secend_spot=neibourids[(relation+4)%6];
		if(role.secend_p.indexOf(secend_spot)==-1)
		{
			role.secend_p.push(secend_spot);
		}
	}
	
	
}


//随机排序函数
var get_random=function(a,b)
{
	return Math.random()>0.5 ? -1 : 1; 
}





// exports.get_random_pos_id=function(gametype)
// {
// 	var pos_ids=[];
// 	// var x,y;

// 	switch(gametype.gametype_id)
// 	{
// 		case 1:
// 			var pos_id=parseInt(gametype.width*gametype.height/2);
// 			pos_ids.push(pos_id);
// 			break;
// 		case 2:
			

			
// 	}

// 	return pos_ids;

// }




