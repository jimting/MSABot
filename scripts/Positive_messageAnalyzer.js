exports.hubotAnalyze =  function(bot, robot, data, team_name)
{
   console.log(data);
   mentionAndAnalyze(bot, robot, data, team_name);
}

/* If mention then do something*/
function mentionAndAnalyze(bot, robot, data, team_name)
{
	var bot_id = "@"+bot.self.id;
	var result = data.text.match(bot_id);
    if(result != null)
    {
		getAnalyzeResult(bot, robot, data, team_name);
    }
}

function getAnalyzeResult(bot, robot, data, team_name)
{
	var request = require('request');
	var options = {
	  uri: 'http://140.121.197.134:4112/webhooks/rest/webhook',
	  method: 'POST',
	  json: {
		"message": data.text
	  }
	};
	
	request(options, function (error, res, body) 
	{
		if (!error && res.statusCode == 200) 
		{
			bot.postMessage(data.channel, body[0].text).then(function(d) 
			{
				var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
				robot.send(admin_data,"("+team_name+")Analyze result : "+ body[0].text);
			});
		}
		if(error)
		{
			var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
			robot.send(admin_data,"Rasa Server is inactive! Please check it!");
			bot.postMessage(data.channel, "Sorry, the server got something wrong. I'll be back in minutes! ");
		}
	});
}