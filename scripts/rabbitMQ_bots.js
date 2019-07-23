module.exports = function(robot) {
    var context = require('rabbit.js').createContext('amqp://140.121.196.23:4111');
    var sub = context.socket('SUBSCRIBE');
    sub.connect('bots');
    sub.setEncoding('utf8');
    sub.on('data', function(note) {
        var user_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
        robot.send(user_data,"有Team新安裝了你的Bot! : "+note);
    });
}

function newBot(botData)
{
	var SlackBot = require('slackbots');
    var bots = robot.brain.get('bots');
    if(bots == null)
        bots = [];
    var token = response.match[2];
    var name = response.match[3];
	var team = response.match[4];
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
    var tempBot = [bot, token, name, team];
    bots.push(tempBot);
    robot.brain.set("bots", bots);
    console.log(bots);
}







