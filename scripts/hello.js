module.exports = function(robot) {
  robot.hear(/(Hello|hello|Hi|hi|你好|安安|早安|午安|晚安|哈囉|安)/, function(response) {
    re = ['Hello', 'hello', 'Hi', 'hi', '你好', '你好啊', '安安', '哈囉','你期待我回覆你什麼？','你以為我是打招呼機器人嗎？','好','打招呼？好',response.match[1]];
    response.send("@"+response.envelope.user.name+":"+response.random(re));
  });
  
  robot.hear(/(analyze)\s(.*)/, function(response) {
    var analyze_string = response.match[2];
	var request = require('request');

	var options = {
	  uri: 'http://140.121.197.134:5005/webhooks/rest/webhook',
	  method: 'POST',
	  json: {
		"message": analyze_string
	  }
	};
	
	request(options, function (error, res, body) 
	{
	  if (!error && res.statusCode == 200) 
	  {
		var buf = Buffer.from(body);
		var buf2 = Buffer.from(res);
		response.send("@"+response.envelope.user.name+":"+buf.toString());
		response.send(buf2.toString())
	  }
	  if(error)
		response.send("[error] @"+response.envelope.user.name+":"+error);
	});

   
  });
}