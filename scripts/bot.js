/**
 * @param {object} data
 */

module.exports = function(robot) {
  robot.hear(/(新連線)\s(.*)\s(.*)\s(.*)\s(.*)/, function(response) {
        
    var SlackBot = require('slackbots');
    var bots = robot.brain.get('bots');
    if(bots == null)
        bots = [];
    var token = response.match[2];
	var auth_token = response.match[3];
    var name = response.match[4];
	var team = response.match[5];
    // create a bot
    var bot = new SlackBot({
        token: token, // Add a bot https://my.slack.com/services/new/bot and put the token 
        name: name
    });

    bot.on('message', function(data) {
       if(data.type!="error")
          console.log(data);
       // more information about additional params https://api.slack.com/methods/chat.postMessage
       if(data.type=="message")
       {
          if(data.subtype!='bot_message')
          {
            //bot.postMessageToChannel('general', "@"+data.user+" : (對我說了) "+data.text); 
            response.send("其他聊天室有互動資料! : "+ JSON.stringify(data));
            hubotAnalyze(bot, response, data);
          }
       }
        
    });
    var tempBot = [bot, token, name, team, auth];
    bots.push(tempBot);
    robot.brain.set("bots", bots);
    console.log(bots);
  });
}

function hubotAnalyze(bot, response, data)
{
    var weather = /(天氣|weather)/;
	var result = data.text.match(weather);
    if(result.length > 0)
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
        bot.postMessage(data.channel, result.toString()); 
        response.send("成功發送天氣資料。");
        
        });
    }
}