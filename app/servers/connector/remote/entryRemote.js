module.exports = function(app) {
	return new EntryRemote(app);
};

var EntryRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var logger = require('pomelo-logger').getLogger(__filename);

/**
 * user join into chat game channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {boolean} flag channel parameter
 *
 */
EntryRemote.prototype.joingame=function(uid,gameid,cb)
{
	var sessionService=this.app.get('sessionService');
	var session=sessionService.getByUid(uid)[0];
	session.set('gameid',gameid);

	// this.app.rpc.game.gameRemote.joingamechannel(uid,gameid,cb);

	logger.info(uid);
	logger.info("joingame:");
	logger.info(gameid);


	var channel = this.channelService.getChannel(gameid, true);


	

	var param = {
		route: 'onJoinGame',
		userid: uid//username
	};
	// channel.pushMessage(param);
	channel.pushMessage('onJoinGame',{uid:uid});

	
	if( !! channel) {
		channel.add(uid, this.app.get('serverId'));
	}


	// cb(this.get(gameid, flag));
	cb();
	
}

/**
 * get user from chat game channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} gameid gameid as channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
EntryRemote.prototype.get = function(gameid, flag)
{
	var users = [];
	var channel = this.channelService.getChannel(gameid, flag);
	if( !! channel) {
		users = channel.getMembers();
	}
	for(var i = 0; i < users.length; i++) {
		users[i] = users[i].split('*')[0];
	}
	return users;
};

/**
 * Kick user out chat game channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 *
 */
EntryRemote.prototype.leavegame = function(uid,gameid,cb)
{
	// var sessionService=this.app.get('sessionService');
	// var session=sessionService.getByUid(uid)[0];
	// session.remove('gameid');

	// this.app.rpc.game.gameRemote.leavegamechannel(uid,gameid,cb);

	var channel = this.channelService.getChannel(gameid, false);
	// leave channel
	if( !! channel) {
		channel.leave(uid, this.app.get('serverId'));
		logger.info(uid);
		logger.info("leavegame:");
		logger.info(gameid);

		var param = {
			route: 'onLeaveGame',
			userid: uid//username
		};
		channel.pushMessage(param);
	}
	cb();
	
};


EntryRemote.prototype.broadcast_action = function(gameid,route,data,cb)
{
	var channel = this.channelService.getChannel(gameid, false);

	if( !! channel) {


		var param = {
			route: route,
			code:200,
			data:data
		};
		channel.pushMessage(param);

		// channel.pushMessage('allPlayerReady',{msg:'msgggg'});
	}
	cb();
	
};