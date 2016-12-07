var skilllib=require('./skill');
var maplib=require('./map');
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

exports.getsightzoon=function(centerid,have_farsight_skill,have_detective_skill,game_total_map,width,height)
{
	var landform_map=game_total_map.landform_map;
	var resource_map=game_total_map.resource_map;
	var result=[];
	var sightdistence=1;
	//拥有远眺技能，视野增加一格
	if(have_farsight_skill)
	{
		sightdistence++;
	}
	//站在山地上，视野增加一格
	if(landform_map[centerid]==2)
	{
		sightdistence++;
	}
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
						if(landform_map[centerid]==2&&landform_map[id]==2)
						{
							if(resource_map[getid(width,tempx,tempy)]!=2)
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
							if(resource_map[getid(width,tempx,tempy)]==2)
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
						if(landform_map[centerid]==2&&landform_map[id]==2)
						{
							if(resource_map[getid(width,tempx1,tempy1)]!=2)
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
							if(resource_map[getid(width,tempx1,tempy1)]==2)
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
					
				}
				else
				{
					road1=false;
				}

				if(tempx2>=0&&tempx2<width&&tempy2>=0&&tempy2<height)
				{
					if(landform_map[getid(width,tempx2,tempy2)]==2)
					{
						if(landform_map[centerid]==2&&landform_map[id]==2)
						{
							if(resource_map[getid(width,tempx2,tempy2)]!=2)
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
							if(resource_map[getid(width,tempx2,tempy2)]==2)
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
						if(landform_map[centerid]==2&&landform_map[id]==2)
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
						if(landform_map[centerid]==2&&landform_map[id]==2)
						{
							if(have_detective_skill==false)
							{
								road1=true;
								if(landform_map[getid(width,tempx11,tempy11)]==2)
								{
									if(resource_map[getid(width,tempx11,tempy11)]==2)
									{
										road1=false;
									}
								}
								if(landform_map[getid(width,tempx21,tempy21)]==2)
								{
									if(resource_map[getid(width,tempx21,tempy21)]==2)
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
								if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx21,tempy21)]==2)
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
						if(landform_map[centerid]==2&&landform_map[id]==2)
						{
							if(have_detective_skill==false)
							{
								road2=true;
								if(landform_map[getid(width,tempx11,tempy11)]==2)
								{
									if(resource_map[getid(width,tempx11,tempy11)]==2)
									{
										road2=false;
									}
								}
								if(landform_map[getid(width,tempx22,tempy22)]==2)
								{
									if(resource_map[getid(width,tempx22,tempy22)]==2)
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
								if(resource_map[getid(width,tempx11,tempy11)]==2||resource_map[getid(width,tempx22,tempy22)]==2)
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
						if(landform_map[centerid]==2&&landform_map[id]==2)
						{
							if(have_detective_skill==false)
							{
								road3=true;
								if(landform_map[getid(width,tempx12,tempy12)]==2)
								{
									if(resource_map[getid(width,tempx12,tempy12)]==2)
									{
										road3=false;
									}
								}
								if(landform_map[getid(width,tempx22,tempy22)]==2)
								{
									if(resource_map[getid(width,tempx22,tempy22)]==2)
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
								if(resource_map[getid(width,tempx12,tempy12)]==2||resource_map[getid(width,tempx22,tempy22)]==2)
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

exports.getsightzoon_of_role=function(roleid,game_total_role,game_total_map,width,height)
{
	var landform_map=game_total_map.landform_map;
	var resource_map=game_total_map.resource_map;
	var role=game_total_role[roleid];
	var sightzoon=exports.getsightzoon(role.pos_id,skilllib.get_role_farsight(role.roleid,game_total_role),skilllib.get_role_detective(role.roleid,game_total_role),game_total_map,width,height);
	return sightzoon;
}

exports.getsightzoon_of_player=function(uid,game_total_role,game_total_map,width,height)
{
	var landform_map=game_total_map.landform_map;
	var resource_map=game_total_map.resource_map;
	var sightzoon=[];
	var role;
	var temp_zoon;
	for(roleid in game_total_role)
	{
		role=game_total_role[roleid];
		if(role.uid==uid)
		{
			temp_zoon=exports.getsightzoon_of_role(role.roleid,game_total_role,game_total_map,width,height);
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

exports.get_roles_in_sightzoon_of_player=function(uid,game_total_role,game_total_map,width,height)
{
	var landform_map=game_total_map.landform_map;
	var resource_map=game_total_map.resource_map;

	var roles={};
	var role;
	var sightzoon=exports.getsightzoon_of_player(uid,game_total_role,game_total_map,width,height);

	for(roleid in game_total_role)
	{
		role=game_total_role[roleid];
		if(sightzoon.indexOf(role.pos_id)!=-1)
		{
			roles[role.roleid]={};
			roles[role.roleid].roleid=role.roleid;
			roles[role.roleid].roledid=role.roledid;
			roles[role.roleid].uid=role.uid;
			roles[role.roleid].pos_id=role.pos_id;
			roles[role.roleid].health=role.health;
			roles[role.roleid].retreating=role.retreating==0?false:true;
			roles[role.roleid].fighting_last_turn=role.fighting_last_turn;
			roles[role.roleid].direction_id=role.direction_id;
			roles[role.roleid].direction_path=role.direction_path;

		}
	}

	return roles;
}

exports.get_roleids_in_sightzoon_of_player=function(uid,game_total_role,game_total_map,width,height)
{
	var landform_map=game_total_map.landform_map;
	var resource_map=game_total_map.resource_map;
	
	var roleids=[];
	var role;
	var sightzoon=exports.getsightzoon_of_player(uid,game_total_role,game_total_map,width,height);

	for(roleid in game_total_role)
	{
		role=game_total_role[roleid];
		if(sightzoon.indexOf(role.pos_id)!=-1)
		{
			roleids.push(role.roleid);

		}
	}

	return roleids;
}


exports.get_pos_movable=function(game_total_role,pos_id)
{
	var movable=true;
	for(roleid in game_total_role)
	{
		var role=game_total_role[roleid];
		if(role.pos_id==pos_id)
		{
			movable=false;
			break;
		}
	}
	return movable;
}

exports.do_role_move=function(roleid,pos_id,game_total_role,game_total_map,game_user_map,width,height)
{
	game_total_role[roleid].pos_id=pos_id;
	var sightzoon=exports.getsightzoon_of_role(roleid,game_total_role,game_total_map,width,height);
	for(id in sightzoon)
	{
		var pos_id=sightzoon[id];
		game_user_map[game_total_role[roleid].uid].detective_map[pos_id]=1;
	}
	
}