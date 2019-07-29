/**
* @param {object} data
*/

module.exports = function(robot) 
{
    init_bot(robot);
}

function init_bot(robot)
{
    //get all bot data from mongodb
    var botData = [];
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://140.121.196.23:4114/apuser";
    var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
    robot.send(admin_data,"(機器人連線)開始初始化所有機器人");
    MongoClient.connect(url, { useNewUrlParser: false }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("apuser");
        dbo.collection("apuser").find({}).toArray(function(err, result) {
            if (err) throw err;
            botData = result;
            //build and init bots
            var bots = [];
            var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
            robot.send(admin_data, "總共有"+botData.length+"個機器人資料");
            console.log("總共有"+botData.length+"個機器人資料");
            for(var i = 0; i < botData.length;i++)
            {
                var token = botData[i].bot_access_token;
                var auth = botData[i].access_token;
                var name = "APMessengerBot";
                var team = botData[i].team_name;
                // create a bot
                var bot = new_bot(token, name, robot, team);
                var tempBot = {bot:bot, token:token, name:name, data:botData[i]};
                bots.push(tempBot);
            }
            robot.brain.set("reconnect_count", 0);
            robot.brain.set("bots", bots);
            console.log(bots);
            db.close();
        });
    }); 
}

function new_bot(token, name, robot, team_name)
{
    var hubotAnalyze = require('./hubotAnalyze').hubotAnalyze;
    var SlackBot = require('slackbots');
    var bot = new SlackBot({
        token: token, // Add a bot https://my.slack.com/services/new/bot and put the token 
        name: name
    });
    bot.on('start', function() {
        // define channel, where bot exist. You can adjust it there https://my.slack.com/services 
        var welcome = ['我又回來了。請先停看聽。', '振作起來好嗎。我剛回來。', '我的老天鵝。我回來了。', '我回來了。', '我回來了。派對收攤。', '我又來了。期待您的使用 ( ͡° ͜ʖ ͡°)', '安安', '嗖。 我剛剛著陸下來。','我剛回來。 可以幫我補血嗎？','挑戰者來了，我 來 也！','我來了。 請給我一罐啤酒。','嘿！快聽！我回來了！', '我剛回來。 似乎太 OP - 請 nerf 一下。', '一個人走很危險，跟我一起走吧！', '我上來了！我又下去了！我又上來了！怎麼樣！我可以一直上來下來！很厲害吧！', '槓上開花加一台（主機）'];
        var welcomeRandom = Math.floor(Math.random()*(welcome.length-1));
        bot.postMessageToChannel('general', welcome[welcomeRandom]);
    });
    bot.on('message', function(data) 
    {
        if(data.type=="message")
        {
            if(data.subtype!='bot_message' && data.bot_id==null)
            {
                var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
                robot.send(admin_data,"("+team_name+")有新活動/使用者編號 "+data.user+" 在 聊天室編號 "+data.channel+" 說 "+data.text);
                hubotAnalyze(bot, robot, data, team_name);
            }
        }
        else if(data.type == 'reconnect_url') 
        {
            bot.wsUrl = data.url;
        }
    });
    bot.on('close', function(data) 
    {
        var reconnect_count = robot.brain.get('reconnect_count');
        reconnect_count = reconnect_count + 1;
        robot.brain.set('reconnect_count', reconnect_count);
        var bots = robot.brain.get('bots');
        if(reconnect_count >= bots.length*3) // 如果重新連3次都沒辦法成功連線
        {
            reset_bot(robot);
            return;
        }
        
        var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
        robot.send(admin_data,"("+ team_name +") : 機器人斷線了 開始嘗試重新連線...");
        bot.connect();
        //reset_bot(robot);
    });
    bot.on('error', function(data) 
    {
        var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
        robot.send(admin_data,"("+ team_name +")機器人遇到錯誤了 :" + data);
    });
    return bot;
}

exports.reset_bot =  function(robot)
{
    var bots = robot.brain.get('bots');
    if(bots == null)
        bots = [];
    var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
    robot.send(admin_data,"遇到連線問題，開始重新設定機器人");
    
    for(var i = 0; i < bots.length;i++)
    {
        //一個一個刪掉
        var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
        robot.send(admin_data,"("+bots[i].data.team_name+")將重新連線");
        delete(bots[i].bot);
    }
    init_bot(robot);
}