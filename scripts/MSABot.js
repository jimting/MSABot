/*#####################################################
###	2019/10/14										###
###	created by jimting								###
###	for MSABot project, and my graduate paper QAQ	###
#######################################################*/

var admin_data = { "room": process.env.adminRoom, "user_id": process.env.adminID};
var MongoClient = require('mongodb').MongoClient;
var userDB = process.env.UserDB;

exports.initBot =  function(robot)
{
   initBot(robot);
}

exports.newBot =  function(token, name, robot, team_name)
{
   newBot(token, name, robot, team_name, true);
}

exports.resetBot =  function(robot)
{
   resetBot(robot);
}

exports.setEureka =  function(robot, bot, channel, url)
{
   setEureka(robot, bot, channel, url);
}

exports.setJenkins =  function(robot, bot, channel, url)
{
   setJenkins(robot, bot, channel, url);
}

exports.setZuul =  function(robot, bot, channel, url)
{
   setZuul(robot, bot, channel, url);
}

exports.getEureka =  function(bot, channel)
{
   return getEureka(bot, channel);
}

exports.getJenkins =  function(bot, channel)
{
   return getJenkins(bot, channel);
}

exports.getZuul =  function(bot, channel)
{
   return getZuul(bot, channel);
}

exports.getBot =  function(robot, bot)
{
   return getBot(robot, bot);
}

exports.checkSetting =  function(robot, bot)
{
   return checkURLSettingStatus(robot, bot, false);
}

var checkURLSettingStatus = function(robot, bot, ifReply)
{
	var eureka = bot.data.eureka;
	var jenkins = bot.data.jenkins;
	var zuul = bot.data.zuul;
	var checkingArray = [];
	
	if( eureka.length == 0)
	{
		checkingArray.push("eureka");
	}
	if( jenkins.length == 0)
	{
		checkingArray.push("jenkins");
	}
	if( eureka.length == 0)
	{
		checkingArray.push("zuul");
	}
	var result = "Hey, I fount that this group has no " + checkingArray + " url set up. \nPlease use \"eureka|jenkins|zuul set http://...\" to set the url for your channels.\nIf you have troubles, just use \"@MSABot help\".";
	
	if(checkingArray.length>0 && ifReply)
	{
		bot.bot.postMessageToChannel('general', result);
		return false;
	}
	
	return true;
	
}

var initBot = function(robot)
{
    //get all bot data from mongodb
    var botData = [];
    robot.send(admin_data,"(Bots Connecting)Bots' initial start.");
    MongoClient.connect(userDB, { useNewUrlParser: false }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("apuser");
        dbo.collection("apuser").find({}).toArray(function(err, result) {
            if (err) throw err;
            botData = result;
            //build and init bots
            var bots = [];
            robot.send(admin_data, "There're "+botData.length+" bots now.");
            for(var i = 0; i < botData.length;i++)
            {
                var token = botData[i].bot_access_token;
                var auth = botData[i].access_token;
                var name = "MSABot";
                var team = botData[i].team_name;
				// the json
				var eureka = botData[i].eureka;
				var jenkins = botData[i].jenkins;
				
                // create a bot
                var bot = newBot(token, name, robot, team, false);
                var tempBot = {bot:bot, token:token, name:name, data:botData[i]};
				checkURLSettingStatus(robot, tempBot, true);
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

var newBot = function(token, name, robot, team_name, isInstall)
{
    var hubotAnalyze = require('./Positive_messageFlow').hubotAnalyze;
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
		if(isInstall)
		{
			bot.postMessageToChannel('general', "Hi, I'm MSABot. I can assist you to look out the service you're developing and maintaining. \n Thank for your installing!\n Use @MSABot help to figure out how to use me!");
			
		}
    });
    bot.on('message', function(data) 
    {
		console.log(data);
        if(data.type=="message")
        {
            if(data.subtype!='bot_message' && data.bot_id==null)
            {
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
        resetBot(robot);
    });
    bot.on('error', function(data) 
    {
        robot.send(admin_data,"("+ team_name +")The bot got something wrong QwQ :" + data);
    });
    bot.login();
    return bot;
}

var resetBot = function(robot)
{
    var reset_check = robot.brain.get('reset_check');
    if(reset_check == "0")
    {
        robot.brain.set('reset_check', "1");
        var bots = robot.brain.get('bots');
        if(bots == null)
            bots = [];
        robot.send(admin_data,"Reset the bots...");
        
        for(var i = 0; i < bots.length;i++)
        {
            if(bots[i].bot.ws._closeCode!=null)
            {
                //一個一個更新
                robot.send(admin_data,"("+bots[i].data.team_name+")The bot will reconnect to RTM.");
                //console.log(bots[i].bot.ws);
                bots[i].bot = newBot(bots[i].data.bot_access_token, "MSABot", robot, bots[i].data.team_name);
            }
            else
            {
                robot.send(admin_data,"("+bots[i].data.team_name+")RTM has no problem.");
            }
        }
        //robot.brain.set("bots", []);
        //initBot(robot);
        setTimeout(function(){ setResetCheck0(robot)}, 5000);
    }
}

var setResetCheck0 = function(robot)
{
    robot.brain.set('reset_check', 0);
    robot.send(admin_data,"All resettings are done.");
}

var setEureka = function(robot, bot, channel, url)
{
	MongoClient.connect(userDB, { useNewUrlParser: false }, function(err, db) {
        if (err) throw err;
		var data = bot.data;
		//remove old data
		for(var i = 0; i < data.eureka.length; i++)
		{
			if(data.eureka[i].channel == channel)
			{
				data.eureka.splice(i, 1);
				break;
			}
		}
		
		data.eureka.push({"channel":channel,"url":url.replace("<", "").replace(">", "")});
		
        var dbo = db.db("apuser"); 
		var myquery = {team_name: bot.data.team_name};
		var newvalues = { $set: {eureka:data.eureka} };
		dbo.collection("apuser").updateOne(myquery, newvalues ,{upsert: true});
		renewBotData(robot, data);
		db.close();
    }); 
}

var setJenkins = function(robot, bot, channel, url)
{
	MongoClient.connect(userDB, { useNewUrlParser: false }, function(err, db) {
        if (err) throw err;
		var data = bot.data;
		//remove old data
		for(var i = 0; i < data.jenkins.length; i++)
		{
			if(data.jenkins[i].channel == channel)
			{
				data.jenkins.splice(i, 1);
				break;
			}
		}
		
		data.jenkins.push({"channel":channel,"url":url.replace("<", "").replace(">", "")});
		
        var dbo = db.db("apuser"); 
		var myquery = {team_name: bot.data.team_name};
		var newvalues = { $set: {jenkins:data.jenkins} };
		dbo.collection("apuser").updateOne(myquery, newvalues, {upsert: true});
		renewBotData(robot, data);
		db.close();
    }); 
}

var setZuul = function(robot, bot, channel, url)
{
	MongoClient.connect(userDB, { useNewUrlParser: false }, function(err, db) {
        if (err) throw err;
		var data = bot.data;
		//remove old data
		for(var i = 0; i < data.zuul.length; i++)
		{
			if(data.zuul[i].channel == channel)
			{
				data.zuul.splice(i, 1);
				break;
			}
		}
		
		data.zuul.push({"channel":channel,"url":url.replace("<", "").replace(">", "")});
		
        var dbo = db.db("apuser"); 
		var myquery = {team_name: bot.data.team_name};
		var newvalues = { $set: {zuul:data.zuul} };
		dbo.collection("apuser").updateOne(myquery, newvalues, {upsert: true});
		renewBotData(robot, data);
		db.close();
    }); 
}
var renewBotData = function(robot, data)
{
	var bots = robot.brain.get('bots');
    if(bots == null)
		bots = [];
	for(var i = 0;i < bots.length; i++)
	{
		if(bots[i].data.team_name == data.team_name)
		{
			bots[i].data = data;
			break;
		}
	}
	robot.brain.set("bots", bots);
}

var getEureka = function(bot, channel)
{
	var eureka = bot.data.eureka
	for(var i = 0;i < eureka.length; i++)
	{
		if(eureka[i].channel == channel)
		{
			return eureka[i].url;
		}
	}
	return null;
}

var getJenkins = function(bot, channel)
{
	var jenkins = bot.data.jenkins
	for(var i = 0;i < jenkins.length; i++)
	{
		if(jenkins[i].channel == channel)
		{
			return jenkins[i].url;
		}
	}
	return null;
}

var getZuul = function(bot, channel)
{
	var zuul = bot.data.zuul
	for(var i = 0;i < zuul.length; i++)
	{
		if(zuul[i].channel == channel)
		{
			return zuul[i].url;
		}
	}
	return null;
}

var getBot = function(robot, bot)
{
	var bots = robot.brain.get('bots');
    if(bots == null)
		bots = [];
	for(var i = 0;i < bots.length; i++)
	{
		if(bots[i].data.team_name == bot.team.name)
		{
			return bots[i];
		}
	}
	return null;
}