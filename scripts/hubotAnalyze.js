exports.hubotAnalyze =  function(bot, robot, data, team_name)
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