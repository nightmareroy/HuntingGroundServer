module.exports = function(app) {
	return new GameRemote(app);
};

var GameRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var logger = require('pomelo-logger').getLogger('pomelo', __filename);
// 例子   logger.info('client %j heartbeat timeout.', socket.id);

/**
 * user join into chat game channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {boolean} flag channel parameter
 *
 */
GameRemote.prototype.joingamechannel=function(uid, gameid,cb)
{

	

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
GameRemote.prototype.get = function(gameid, flag) {
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
GameRemote.prototype.leavegamechannel = function(uid, gameid,cb) {
	
	cb();
};
