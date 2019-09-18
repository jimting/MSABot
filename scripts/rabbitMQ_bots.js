module.exports = function(robot) 
{
    var context = require('rabbit.js').createContext('amqp://140.121.196.23:4111');
    var sub = context.socket('SUBSCRIBE');
    sub.connect('bots');
    sub.setEncoding('utf8');
    sub.on('data', function(note) {
        var botData = JSON.parse(note);
        var user_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
        robot.send(user_data,"There're new user installing your Bot! : "+botData.team_name);
        newBot(botData, robot);
    });
}

function newBot(botData, robot){
    var hubotAnalyze = require('./hubotAnalyze').hubotAnalyze;
    var SlackBot = require('slackbots');
    var token = botData.bot_access_token;
    var auth = botData.access_token;
    var name = "APMessengerBot";
    var team = botData.team_name;
    // create a bot
    console.log(token);
    var bot = new SlackBot({
        token: token, // Add a bot https://my.slack.com/services/new/bot and put the token 
        name: name
    });
    var tempBot = {bot:bot, token:token, name:name, data:botData};
    var bots = robot.brain.get('bots');
    if(bots == null)
        bots = [];
    bots.push(tempBot);
    robot.brain.set("bots", bots);
    console.log(bots);

    bot.on('message', function(data) 
    {
        var team_name = team;
        if(data.type!="error")
        console.log(data);
        if(data.type=="message")
        {
            if(data.subtype!='bot_message' && data.bot_id==null)
            {
                //先找出這個訊息是哪個group收到的，找出列表中的位置，目前只能一個一個檢查QAQ
                var bots = robot.brain.get('bots');
                for(var k = 0;k < bots.length;k++)
                {
                    if(data.team == bots[k].data.team_id)
                    {
                        var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
                        robot.send(admin_data,"("+bots[k].data.team_name+")Has new activity :");
                        hubotAnalyze(bots[k].bot, robot, data, bots[k].data.team_name);
                    }
                }
            }
        }

    });
}







