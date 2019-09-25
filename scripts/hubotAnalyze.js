exports.hubotAnalyze =  function(bot, robot, data, team_name)
{
   console.log(data);
   mentionAndAnalyze(bot, robot, data, team_name);
   weather(bot, robot, data, team_name);
   hello(bot, robot, data, team_name);
}

function weather(bot, robot, data, team_name)
{
    var weather = /(weather)/;
    var result = data.text.match(weather);
    if(result != null)
    {
        var request = require("request");
        var fs = require("fs");
        var cheerio = require("cheerio");
        request({
            url: "https://www.cwb.gov.tw/V7/forecast/txt/w01.htm",
            method: "GET"
        }, function(e,r,b) {
        if(e || !b) { return; }
        var $ = cheerio.load(b);
        var result = [];
        var titles = $("pre");
        for(var i=0;i<titles.length;i++) 
        {
            result.push($(titles[i]).text());
        }
        bot.postMessage(data.channel, result.toString()).then(function(data) {
            var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
            robot.send(admin_data,"("+team_name+")Sending the weather data successfully.");
        });
        
        });
    }
}

function hello(bot, robot, data, team_name)
{
    var hello = /(Hello|hello|Hi|hi)/;
    var result = data.text.match(hello);
    if(result != null)
    {
        var re = ['Hello', 'hello', 'Hi', 'hi', "Hello there", "Hi there！", "Long time no see！",   result];
        var reRandom = Math.floor(Math.random()*(re.length-1));
        bot.postMessage(data.channel, re[reRandom]).then(function(data) {
            var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
            robot.send(admin_data,"("+team_name+")Sending the hello data successfully.");
        })
        
    }
}

function mentionAndAnalyze(bot, robot, data, team_name)
{
	var bot_id = bot.self.id;
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
	  uri: 'http://140.121.197.134:5005/webhooks/rest/webhook',
	  method: 'POST',
	  json: {
		"message": data.text
	  }
	};
	
	request(options, function (error, res, body) 
	{
	  if (!error && res.statusCode == 200) 
	  {
		  replyText(bot, robot, data, team_name, body);
	  }
	  if(error)
		  bot.postMessage(data.channel, "Something wild occur! I can't analyze what you meaning!");
	});
}

function replyText(bot, robot, data, team_name, ana_result)
{
	console.log(ana_result);
	bot.postMessage(data.channel, ana_result[0].text).then(function(d) {
        var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
        robot.send(admin_data,"("+team_name+")Analyze result : "+ ana_result[0].text);
    });
}