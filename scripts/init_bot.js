/**
* @param {object} data
*/

module.exports = function(robot) {
    
    //get all bot data from mongodb
    var botData = [];
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://140.121.196.23:4114/apuser";
    MongoClient.connect(url, { useNewUrlParser: false }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("apuser");
        dbo.collection("apuser").find({}).toArray(function(err, result) {
            if (err) throw err;
            botData = result;
            //build and init bots
            var SlackBot = require('slackbots');
            var bots = robot.brain.get('bots');
            if(bots == null)
                bots = [];
            
            console.log(botData)
            console.log("總共有"+botData.length+"個機器人資料");
            for(var i = 0; i < botData.length;i++)
            {
                var token = botData[i].bot_access_token;
                var auth = botData[i].access_token;
                var name = "APMessengerBot";
                var team = botData[i].team_name;
                // create a bot
                var bot = new SlackBot({
                    token: token, // Add a bot https://my.slack.com/services/new/bot and put the token 
                    name: name
                });

                bot.on('message', function(data) 
                {
					var team_name = team;
                    if(data.type!="error")
                    console.log(data);
                    // more information about additional params https://api.slack.com/methods/chat.postMessage
                    if(data.type=="message")
                    {
                        if(data.subtype!='bot_message' && data.bot_id==null)
                        {
                            //bot.postMessageToChannel('general', "@"+data.user+" : (對我說了) "+data.text); 
                            var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
                            robot.send(admin_data,"("+team_name+")有新活動:");
                            hubotAnalyze(bot, robot, data, team_name);
                        }
                    }

                });
                var tempBot = [bot, token, name, team, auth];
                bots.push(tempBot);
                robot.brain.set("bots", bots);
                console.log(bots);
            }
            db.close();
        });
    }); 
}

function hubotAnalyze(bot, robot, data, team_name)
{
   weather(bot, robot, data, team_name);
   hello(bot, robot, data, team_name);
}

function weather(bot, robot, data, team_name)
{
    var weather = /(天氣|weather)/;
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
        bot.postMessage(data.channel, result.toString()); 
        var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
        robot.send(admin_data,"("+team_name+")成功發送天氣資料。");
        
        });
    }
}

function hello(bot, robot, data, team_name)
{
    var hello = /(Hello|hello|Hi|hi|你好|安安|早安|午安|晚安|哈囉|安|嗨)/;
    var result = data.text.match(hello);
    if(result != null)
    {
        var re = ['Hello', 'hello', 'Hi', 'hi', '你好', '你好啊', '安安', '哈囉','你期待我回覆你什麼？','你以為我是打招呼機器人嗎？','好','打招呼？好', result];
        var reRandom = Math.floor(Math.random()*(re.length-1));
        bot.postMessage(data.channel, re[reRandom]); 
        var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
        robot.send(admin_data,"("+team_name+")成功發送打招呼資訊。");
        
    }
}