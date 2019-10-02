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
	// setting all the result to false
	var status = { "action_service_health":false, "action_service_info":false, "action_service_using_info":false, "action_service_api_list":false, "action_service_env":false };
	
	// setting the stage
	// stage 0 : if analyze no intent, ask the intent.
	// stage 1 : analyze the intent
	// stage 2 : if lack service name, ask service name.
	var stage = 0;
	
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
			// check what result it is ! 
			// json : {'intent': 'action_name', 'service': 'service_name'}
			//switch(body[0].text['service']){}
			bot.postMessage(data.channel, body[0].text['intent']).then(function(d) 
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