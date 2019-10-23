/*#####################################################
###	2019/10/14										###
###	created by jimting								###
###	for MSABot project, and my graduate paper QAQ	###
#######################################################*/

var admin_data = { "room": process.env.adminRoom, "user_id": process.env.adminID};
var MSABot = require('./MSABot');
var jenkinsapi = require('jenkins-api');


exports.hubotAnalyze =  function(bot, robot, data, team_name)
{
   console.log(data);
   //if not mention user, means that user may use the setting func.
   if(!mentionAndAnalyze(bot, robot, data, team_name))
   {
	   commandAnalyze(bot, robot, data, team_name);
   }
}

/* setting the  */
function commandAnalyze(bot, robot, data, team_name)
{
	var command = /(\S*)\s(\S*)\s?(.*)?/;
	var result = data.text.match(command);
	console.log(result);
	var bot_in_brain = MSABot.getBot(robot, bot);
	// 1. eureka or jenkins, we use "service"
	// 2. what user want, we use "intent"
	var service = result[1];
	if(service != null)
	{
		switch(service)
		{
			case "eureka":
				var intent = result[2];
				if(intent != null)
				{
					switch(intent)
					{
						case "url":
							var url = MSABot.getEureka(bot_in_brain, data.channel);
							if(url != null)
								bot.postMessage(data.channel, "The channel's Eureka Server URL is : " + url);
							else
								bot.postMessage(data.channel, "This channel doesn't set the Eureka Server Url.");
							break;
						case "set":
							MSABot.setEureka(robot, bot_in_brain, data.channel, result[3]);
							bot.postMessage(data.channel, "Successfully setting the Eureka server.");
							break;
					}
				}
				break;
				
			case "jenkins":
				var intent = result[2];
				if(intent != null)
				{
					switch(intent)
					{
						case "url":
							var url = MSABot.getJenkins(bot_in_brain, data.channel);
							if(url != null)
								bot.postMessage(data.channel, "The channel's Jenkins Server URL is : " + url);
							else
								bot.postMessage(data.channel, "This channel doesn't set the Jenkins Server Url.");
							break;
						case "set":
							MSABot.setJenkins(robot, bot_in_brain, data.channel, result[3]);
							bot.postMessage(data.channel, "Successfully setting the Jenkins server.");
							break;
					}
				}
				break;
				
			case "zuul":
				var intent = result[2];
				if(intent != null)
				{
					switch(intent)
					{
						case "url":
							var url = MSABot.getZuul(bot_in_brain, data.channel);
							if(url != null)
								bot.postMessage(data.channel, "The channel's Zuul URL is : " + url);
							else
								bot.postMessage(data.channel, "This channel doesn't set the Zuul Url.");
							break;
						case "set":
							MSABot.setZuul(robot, bot_in_brain, data.channel, result[3]);
							bot.postMessage(data.channel, "Successfully setting the Zuul server.");
							break;
					}
				}
				break;
		}
	}
}

/* If mention then do something*/
function mentionAndAnalyze(bot, robot, data, team_name)
{
	var bot_id = "@"+bot.self.id;
	var result = data.text.match(bot_id);
	data.text = data.text.replace("<"+bot_id+"> ", "");
	console.log(data.text);
    if(result != null)
    {
		stage0(bot, robot, data, team_name);
		return true;
    }
	else
		return false;
}

/*===================================*/
// stage 0 : if analyze no intent, ask the intent, if have, go stage1 
// stage 1 : analyze the intent result, if have service name, skip stage2 to mission | if the intent doesn't need the service name, go to stage3
// stage 2 : if lack service name, ask service name.
// stage 3 : mission.
/*===================================*/

/* send request and check if result has intent */
function stage0(bot, robot, data, team_name)
{
	var request = require('request');
	var options = {
	  uri: process.env.RasaUrl + '/webhooks/rest/webhook',
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
			var service = json_data.service;

			// check what result it is ! 
			// json : {'intent': 'action_name', 'service': 'service_name'}
			// check if the result include the service name.
			
			var stage = robot.brain.get('stage'+data.channel);
			console.log("此對話階段 : " + stage);
			if(stage == 2 && stage != null)
			{
				console.log("有先前對話進行中");
				intent_before = robot.brain.get('intent'+data.channel);
				stage1(bot, robot, data, team_name, service, intent_before);
			}
			else if(intent != "none")
			{
				stage1(bot, robot, data, team_name, service, intent);
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
			robot.send(admin_data,"Rasa Server is inactive! Please check it!");
			bot.postMessage(data.channel, "Sorry, the server got something wrong. I'll be back in minutes! QAQ");
			// end the flow
		}
	});
}

/*check if the result has service name */
function stage1(bot, robot, data, team_name, service, intent)
{
	// setting the stage and intent first.
	robot.brain.set("stage"+data.channel, 1);
	robot.brain.set("intent"+data.channel, intent);
	
	/* intents that don't need the service name */
	switch(intent)
	{
		case "action_service_env"		:action_service_env(bot, robot, data, team_name);return;
		case "bot_help" : action_bot_help(bot, robot, data, team_name);return;
		case "action_service_health"	:action_service_health(bot, robot, data, team_name);return;
		default : break;
	}

	/* if have no service name, ask them the service name */
	if(service=="none" || service==null)
	{
		stage2(bot, robot, data, team_name, intent);
	}
	else /* if have, go to stage3 */
	{
		switch(intent)
		{
			case "action_detail_api"		:action_detail_api(bot, robot, data, team_name, service);return;
			case "action_connect_error"		:action_connect_error(bot, robot, data, team_name, service);return;
			case "action_build_fail"		:action_build_fail(bot, robot, data, team_name, service);return;
			case "action_service_info"		:action_service_info(bot, robot, data, team_name, service);return;
			case "action_service_using_info":action_service_using_info(bot, robot, data, team_name, service);return;
			case "action_service_api_list"	:action_service_api_list(bot, robot, data, team_name, service);return;
		}
	}
}

/* to ask user what service he/she wants */
function stage2(bot, robot, data, team_name, intent)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 2);
	
	var intentStr = "";
	switch(intent)
	{
		case "action_detail_api"		:intentStr = "service api's detail";break;
		case "action_connect_error"		:intentStr = "service's connect error data";break;
		case "action_build_fail"		:intentStr = "service's last failed building data";break;
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

/* Dev Status : true */
/* using guide for MSABot */
function action_bot_help(bot, robot, data, team_name)
{
	var using_guide = "Hi, I'm MSABot. I can assist you to look out the service you're developing and maintaining.\nHow to use me? : \n";
	using_guide += "** Catch your service information **\n";
	using_guide += "1. Searching the service's health data. ex. @MSABot, I want the health data for ServiceA.\n";
	using_guide += "2. Searching the service's information. ex. @MSABot, I want the information for ServiceA.\n";
	using_guide += "3. Searching the service's overview.	ex. @MSABot, Tell me the overview for ServiceA.\n";
	using_guide += "4. Searching the service's api list.	ex. @MSABot, Give me the api list on ServiceA.\n";
	using_guide += "5. Searching the env setting.			ex. @MSABot, Tell me the env setting info.\n";
	using_guide += "6. Searching the build data on Jenkins. ex. @MSABot, What's the reason my building failed for ServiceA?\n";
	using_guide += "7. Searching the connection status on Eureka. ex. @MSABot, Tell me the connection error about ServiceA.\n";
	using_guide += "(Not yet)8. Get the dependency graph from VMAMV.	ex. @MSABot, give me the dependency graph.\n";
	using_guide += "** Change your server setting **\n";
	using_guide += "8. Setting the Eureka/Jenkins Url. ex. \"eureka/jenkins set http://...\"";
	
	bot.postMessage(data.channel, using_guide);
}

/* Dev Status : true */
/* send the service's last failed build data to user */
function action_build_fail(bot, robot, data, team_name, service)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	var bot_in_brain = MSABot.getBot(robot, bot);
	var jenkins_url = MSABot.getJenkins(bot_in_brain, data.channel);
	if(jenkins_url != null)
	{
		var jenkins = jenkinsapi.init(jenkins_url);
		jenkins.last_build_info(service, function(err, json) {
			if (err){ return console.log(err); }
			var result = json.fullDisplayName + "'s last build is " + json.result + "\n";
			result += "Check it on your Jenkins server : " + json.url;
			bot.postMessage(data.channel, result);
		});
		
		robot.send(admin_data,"("+team_name+") [CHANNEL:"+data.channel+"] Sending the jenkins building data successfully!");
	}
}

/* Dev Status : false */
/* send the service's connection error data to user */
function action_connect_error(bot, robot, data, team_name, service)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	
	bot.postMessage(data.channel, "Here is service \"" + service +"\" 's action_connect_error.");
	robot.send(admin_data,"("+team_name+") [CHANNEL:"+data.channel+"] Sending the action_connect_error information successfully!");
}

/* Dev Status : true */
/* send service's health data to user */
function action_service_health(bot, robot, data, team_name)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	
	// get the eureka url for this channel
	var bot_in_brain = MSABot.getBot(robot, bot);
	eureka_url = MSABot.getEureka(bot_in_brain, data.channel);
	
	var request = require("request");
	var fs = require("fs");
	var cheerio = require("cheerio");
	request({
		url: eureka_url+"/eureka/apps",
		method: "GET"
	}, 
	function(e,r,b) 
	{
		if(e || !b) { return; }
		var $ = cheerio.load(b);
		var result = "";
		var applications = $("application");
		for(var i=0;i<applications.length;i++) 
		{
			result += (i+1) + ". " + applications.eq(i).find('name').eq(0).text() + " : " + applications.eq(i).find('status').text() + "\n";
		}
		
		bot.postMessage(data.channel, "Here are the services' health status : \n" + result);
	
	});
	/*
	var fs = require("fs");
	fs.readFile('scripts/data/service_health.txt', 'utf8', function(err, d) 
	{
		var json_data = JSON.parse(d);
		var result = "Hey, the " + service + " 's health data is down below: \n";
		result += "The status to this service : " + json_data.status + "\n";
		result += "The Composite Discovery Client is : " + json_data.discoveryComposite.status+ "\n";
		result += "The Eureka Server is : " + json_data.discoveryComposite.eureka.status+ "\n";
		result += "The hytrix status is : " + json_data.hystrix.status+ "\n";
		console.log(result);
		bot.postMessage(data.channel, result);
		robot.send(admin_data,"("+team_name+") [CHANNEL:"+data.channel+"] Sending the service health data successfully!");
    });*/
}

/* Dev Status : true */
/* send service's info to user */
function action_service_info(bot, robot, data, team_name, service)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	
	// get the zuul url for this channel
	var bot_in_brain = MSABot.getBot(robot, bot);
	zuul_url = MSABot.getZuul(bot_in_brain, data.channel);
	
	var request = require("request");
	var fs = require("fs");
	var cheerio = require("cheerio");
	request({
		url: zuul_url + service + "/info/",
		method: "GET"
	}, 
	function(e,r,b) 
	{
		if(e || !b) { return; }
		console.log(b);
		var json = JSON.parse(b);
		
		var result = "See! I found these on service " + service + " ! \n";
		result += "Version : " + json.version + "\n";
		result += "Group : " + json.build.group + "\n";
		result += "Git URL : " + json.git.remote.origin.url + "\n";
		result += "Git branch : " + json.git.branch + "\n";
		result += "Git user : " + json.git.commit.user.name + "\n";
		result += "(If this service has some problems contact him/her by : "+ json.git.commit.user.email +" )\n"
		result += "Total commit count : " + json.git.total.commit.count + "\n";
		
		result += "See detail information on Swagger! : " + zuul_url + service + "/swagger-ui.html/";
		bot.postMessage(data.channel, result);
	
	});
	
	robot.send(admin_data,"("+team_name+") [CHANNEL:"+data.channel+"] Sending the service information successfully!");
}

/* Dev Status : true */
/* send service's using_info to user */
function action_service_using_info(bot, robot, data, team_name, service)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	// get the zuul url for this channel
	var bot_in_brain = MSABot.getBot(robot, bot);
	zuul_url = MSABot.getZuul(bot_in_brain, data.channel);
	
	var request = require("request");
	var fs = require("fs");
	request({
		url: zuul_url + service + "/metrics",
		method: "GET"
	}, 
	function(e,r,b) 
	{
		if(e || !b) { return; }
		console.log(b);
		var json = JSON.parse(b);
		
		var result = "";
		
		var count_200 = 0;
		var count_404 = 0;
		var count_503 = 0;
		
		var index = [];

		// build the index
		for (var x in json) 
		{
		   index.push(x);
		}
		
		for (var i = 0;i < index.length; i++)
		{
			if(index[i].includes("200")) count_200++;
			if(index[i].includes("404")) count_404++;
			if(index[i].includes("503")) count_503++;
		}
		pie_chart_data = "{type:'pie',data:{labels:['200','404','503'],datasets:[{data:["+count_200+","+count_404+","+count_503+"]}]}}";

		result += "The total using amount is : " + (count_200+count_404+count_503) + "\n";
		result += "See the pie chart I prepared for you! \n";
		result += "https://quickchart.io/chart?c=" + pie_chart_data;
		bot.postMessage(data.channel, result);
	
	});
	
	robot.send(admin_data,"("+team_name+") [CHANNEL:"+data.channel+"] Sending the service overview successfully!");
}

/* Dev Status : true */
/* send service's api list to user */
function action_service_api_list(bot, robot, data, team_name, service)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	// get the zuul url for this channel
	var bot_in_brain = MSABot.getBot(robot, bot);
	zuul_url = MSABot.getZuul(bot_in_brain, data.channel);
	
	var request = require("request");
	var fs = require("fs");
	request({
		url: zuul_url + service + "/v2/api-docs/",
		method: "GET"
	}, 
	function(e,r,b) 
	{
		if(e || !b) { return; }
		console.log(b);
		var json = JSON.parse(b);
		
		var result = json.info.title + " : " + json.tags[0].name + "\n";
		result += "(" + json.tags[0].description + ")\n";
		result += "If this service went some problems, please call " + json.info.contact.name + "\n";
		result += "Some api intro : \n";
		
		var index = [];

		// build the index
		for (var x in json.paths) 
		{
		   index.push(x);
		}
		for (var i = 0;i < index.length; i++)
		{
			result += index[i] + " : " + json.paths[index[i]].get.summary + "\n";
		}
		
		result += "See detail information on Swagger! : " + zuul_url + service + "/swagger-ui.html/";
		bot.postMessage(data.channel, result);
	
	});
	
	robot.send(admin_data,"("+team_name+") [CHANNEL:"+data.channel+"] Sending the service api list successfully!");
}

/* Dev Status : true */
/* send the env setting data to user */
function action_service_env(bot, robot, data, team_name)
{
	// setting the stage first.
	robot.brain.set("stage"+data.channel, 0);
	
	// get the zuul url for this channel
	var bot_in_brain = MSABot.getBot(robot, bot);
	eureka_url = MSABot.getEureka(bot_in_brain, data.channel);
	
	var request = require("request");
	var fs = require("fs");
	request({
		url: eureka_url + "env/",
		method: "GET"
	}, 
	function(e,r,b) 
	{
		if(e || !b) { return; }
		console.log(b);
		var json = JSON.parse(b);
		
		var result = "I found some env settings on your eureka server! \n";
		result += "This channel's Eureka server is : " + MSABot.getEureka(bot_in_brain, data.channel) + "\n";
		result += "This channel's Jenkins server is : " + MSABot.getJenkins(bot_in_brain, data.channel) + "\n";
		result += "This channel's Zuul server is : " + MSABot.getZuul(bot_in_brain, data.channel) + "\n";
		
		var index = [];
		var properties = "applicationConfig: [classpath:/application.properties]";
		// build the index
		for (var x in json[properties]) 
		{
		   index.push(x);
		}
		for (var i = 0;i < index.length; i++)
		{
			result += "The env "+ index[i] +" is : " + json[properties][index[i]] + "\n";
		}
		
		bot.postMessage(data.channel, result);
	
	});
	robot.send(admin_data,"("+team_name+") [CHANNEL:"+data.channel+"] Sending the env information successfully!");
}