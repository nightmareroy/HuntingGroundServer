module.exports = function(app) {
	return new GamelistRemote(app);
};

var GamelistRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var logger = require('pomelo-logger').getLogger(__filename);


var gamedic={};

GamelistRemote.prototype.registerGame = function(gamemsg,cb)
{
	gamedic[gamemsg.gameid]=gamemsg;

	var channel = this.channelService.getChannel(0, false);

	if( !! channel) {


		var param = {
			route: "register_game",
			code:200,
			data:gamemsg
		};
		channel.pushMessage(param);
	}
	cb();
	
};

GamelistRemote.prototype.unRegisterGame = function(gameid,cb)
{
	delete gamedic.gameid;

	var channel = this.channelService.getChannel(0, false);

	if( !! channel) {


		var param = {
			route: "unregister_game",
			code:200,
			data:gameid
		};
		channel.pushMessage(param);
	}
	cb();
	
};

GamelistRemote.prototype.getGameDic = function(cb)
{
	cb(gamedic);
}