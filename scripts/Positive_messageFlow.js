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
		var stage = robot.brain.get('stage'+data.channel);
		switch(stage)
		{
			// if got stage 1, means that the channel lack the service name. and the next input should include the service name XD
			case 2 :
				var intent = robot.brain.get('intent'+data.channel);
				stage1(bot, robot, data, team_name, intent);
				break;
			default : 
				stage0(bot, robot, data, team_name);
		}
    }
}

// stage 0 : if analyze no intent, ask the intent, if have, go stage1
// stage 1 : analyze the intent result, if have service name, skip stage2 to mission
// stage 2 : if lack service name, ask service name.
// stage 3 : mission.

/* send request and check if result has intent */
function stage0(bot, robot, data, team_name)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	
	var request = require('request');
	var options = {
	  uri: 'http://140.121.197.134:4112/webhooks/rest/webhook',
	  method: 'POST',
	  json: 
	  {
		"message": data.text
	  }
	};
	
	request(options, function (error, res, body) 
	{
		if (!error && res.statusCode == 200) 
		{
			// parse the ' to ", because Rasa always return json with '
			var json_data = JSON.parse((body[0].text).replace(/'/g, '"'));
			console.log(json_data);
			var intent = json_data.intent;
			// check what result it is ! 
			// json : {'intent': 'action_name', 'service': 'service_name'}
			// check if the result include the service name.
			if(intent != "none")
			{
				stage1(bot, robot, data, team_name, json_data, intent);
			}
			else
			{
				var result = "Sorry, I don't know what you wanna do accurately. Please retry again!";
				bot.postMessage(data.channel, result);
				// end the flow
			}
		}
		if(error)
		{
			var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
			robot.send(admin_data,"Rasa Server is inactive! Please check it!");
			bot.postMessage(data.channel, "Sorry, the server got something wrong. I'll be back in minutes! QAQ");
			// end the flow
		}
	});
}

/*check if the result has service name*/
function stage1(bot, robot, data, team_name, json_data, intent)
{
	// setting the stage and intent first.
	robot.brain.set("stage"+data.channel, 1);
	robot.brain.set("intent"+data.channel, 0);
	
	var service = json_data.service;
	if(service=="none" | service==null)
	{
		stage2(bot, robot, data, team_name, intent);
	}
	else
	{
		switch(intent)
		{
			case "action_service_health"	:action_service_health(bot, robot, data, team_name, service);break;
			case "action_service_info"		:action_service_info(bot, robot, data, team_name, service);break;
			case "action_service_using_info":action_service_using_info(bot, robot, data, team_name, service);break;
			case "action_service_api_list"	:action_service_api_list(bot, robot, data, team_name, service);break;
			case "action_service_env"		:action_service_env(bot, robot, data, team_name, service);break;
		}
	}
}

function stage2(bot, robot, data, team_name, intent)
{
	// setting the stage first.
	robot.brain.set("stage", 2);
	
	var intentStr = "";
	switch(intent)
	{
		case "action_service_health"	:intentStr = "service's health data";break;
		case "action_service_info"		:intentStr = "service's information";break;
		case "action_service_using_info":intentStr = "service's using overview";break;
		case "action_service_api_list"	:intentStr = "service's api list";break;
		case "action_service_env"		:intentStr = "service's env setting";break;
	}
	var result = "Hey, before we catch the "+intentStr+", we need to know what service you wanna search. ";
	bot.postMessage(data.channel, result);
	
	//end the flow
}

function action_service_health(bot, robot, data, team_name, service)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	
	var fs = require("fs");
	fs.readFile('scripts/data/service_health.txt', 'utf8', function(err, data) 
	{
		var health_data = "";
		var tokens = data.split("\r\n");
		for(var token in tokens)
			health_data+=token;
	
		console.log(health_data);
		var json_data = JSON.parse(health_data);
		var result = "Hey, the " + service + " 's health data is down below: \n";
		result += "The status to this service : " + json_data.status + "\n";
		result += "The Composite Discovery Client is : " + json_data.discoveryComposite.status;
		result += "The Eureka Server is : " + json_data.discoveryComposite.eureka.status;
		result += "The hytrix status is : " + json_data.hystrix.status;
		
		var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
		robot.send(admin_data,"Sending the health data result success!");
		
		bot.postMessage(data.channel, result);
    });
}

function action_service_info(bot, robot, data, team_name, service)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	
	bot.postMessage(data.channel, "Here is service \"" + service +"\" 's information.");
}

function action_service_using_info(bot, robot, data, team_name, service)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	
	bot.postMessage(data.channel, "Here is service \"" + service +"\" 's using overview.");
}

function action_service_api_list(bot, robot, data, team_name, service)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	
	bot.postMessage(data.channel, "Here is service \"" + service +"\" 's api list.");
}

function action_service_env(bot, robot, data, team_name, service)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	
	bot.postMessage(data.channel, "Here is service \"" + service +"\" 's env setting.");
}