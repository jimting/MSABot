module.exports = function(robot) {
	var context = require('rabbit.js').createContext('amqp://140.121.196.23:4111');
	var sub = context.socket('SUBSCRIBE');
	sub.connect('exchangeString');
	sub.setEncoding('utf8');
	sub.on('data', function(note) {
		var user_data = { "room": "D9PCFGPH9", "user_id": 'handsome841206'};
		robot.send(user_data,"Received : "+note)
	});
}







