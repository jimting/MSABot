module.exports = function(robot) {
	var context = require('rabbit.js').createContext('amqp://140.121.196.23:4111');
	var sub = context.socket('SUBSCRIBE');
	sub.connect('exchangeString');
	sub.setEncoding('utf8');
	sub.on('data', function(note) {
		var json = JSON.parse(note);
		var user_data = { "room": json.roomNumber, "user_id": json.userID};
		String result = "[公告]專案 " + json.build_name + "第"+json.build_number+"次建置剛剛執行了！建置結果："+json.build_status;
		robot.send(user_data,result)
	});
}







