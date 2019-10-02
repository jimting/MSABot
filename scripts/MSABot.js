exports.init_bot =  function(robot)
{
   init_bot(robot);
}

exports.reset_bot =  function(robot)
{
   reset_bot(robot);
}


var init_bot = function(robot)
{
    //get all bot data from mongodb
    var botData = [];
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://140.121.196.23:4114/apuser";
    var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
    robot.send(admin_data,"(Bots Connecting)Bots' initial start.");
    MongoClient.connect(url, { useNewUrlParser: false }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("apuser");
        dbo.collection("apuser").find({}).toArray(function(err, result) {
            if (err) throw err;
            botData = result;
            //build and init bots
            var bots = [];
            var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
            robot.send(admin_data, "There're "+botData.length+" bots now.");
            for(var i = 0; i < botData.length;i++)
            {
                var token = botData[i].bot_access_token;
                var auth = botData[i].access_token;
                var name = "MSABot";
                var team = botData[i].team_name;
                // create a bot
                var bot = new_bot(token, name, robot, team);
                var tempBot = {bot:bot, token:token, name:name, data:botData[i]};
                bots.push(tempBot);
            }
            robot.brain.set("reconnect_count", 0);
            robot.brain.set("bots", bots);
            robot.brain.set('reset_check', 0);
            console.log(bots);
            db.close();
        });
    }); 
}

var new_bot = function(token, name, robot, team_name)
{
    var hubotAnalyze = require('./Positive_messageAnalyzer').hubotAnalyze;
    var SlackBot = require('slackbots');
    var bot = new SlackBot({
        token: token, // Add a bot https://my.slack.com/services/new/bot and put the token 
        name: name,
        disconnect: true
    });
    bot.on('start', function() {
        // define channel, where bot exist. You can adjust it there https://my.slack.com/services 
        var welcome = ['我又回來了。請先停看聽。', '振作起來好嗎。我剛回來。', '我的老天鵝。我回來了。', '我回來了。', '我回來了。派對收攤。', '我又來了。期待您的使用 ( ͡° ͜ʖ ͡°)', '安安', '嗖。 我剛剛著陸下來。','我剛回來。 可以幫我補血嗎？','挑戰者來了，我 來 也！','我來了。 請給我一罐啤酒。','嘿！快聽！我回來了！', '我剛回來。 似乎太 OP - 請 nerf 一下。', '一個人走很危險，跟我一起走吧！', '我上來了！我又下去了！我又上來了！怎麼樣！我可以一直上來下來！很厲害吧！', '槓上開花加一台（主機）'];
        var welcomeRandom = Math.floor(Math.random()*(welcome.length-1));
        bot.postMessageToChannel('general', "[機器人重新連線]"+welcome[welcomeRandom]);
    });
    bot.on('message', function(data) 
    {
        if(data.type=="message")
        {
            if(data.subtype!='bot_message' && data.bot_id==null)
            {
                var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
                robot.send(admin_data,"("+team_name+") [CHANNEL:"+data.channel+"] "+data.user+" : "+data.text);
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
        reset_bot(robot);
    });
    bot.on('error', function(data) 
    {
        var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
        robot.send(admin_data,"("+ team_name +")The bot got something wrong QwQ :" + data);
    });
    bot.login();
    return bot;
}

var reset_bot = function(robot)
{
    var reset_check = robot.brain.get('reset_check');
    if(reset_check == "0")
    {
        robot.brain.set('reset_check', "1");
        var bots = robot.brain.get('bots');
        if(bots == null)
            bots = [];
        var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
        robot.send(admin_data,"Reset the bots...");
        
        for(var i = 0; i < bots.length;i++)
        {
            if(bots[i].bot.ws._closeCode!=null)
            {
                //一個一個更新
                var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
                robot.send(admin_data,"("+bots[i].data.team_name+")The bot will reconnect to RTM.");
                //console.log(bots[i].bot.ws);
                bots[i].bot = new_bot(bots[i].data.bot_access_token, "APMessengerBot", robot, bots[i].data.team_name);
            }
            else
            {
                var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
                robot.send(admin_data,"("+bots[i].data.team_name+")RTM has no problem.");
            }
        }
        //robot.brain.set("bots", []);
        //init_bot(robot);
        setTimeout(function(){ setResetCheck0(robot)}, 5000);
    }
}

var setResetCheck0 = function(robot)
{
    robot.brain.set('reset_check', 0);
    var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
    robot.send(admin_data,"All resettings are done.");
}