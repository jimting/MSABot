var admin_data = { "room": process.env.adminRoom, "user_id": process.env.adminID};
		
module.exports = function(robot) 
{
	/*########## for bot's installing detecting ##########*/
    var context = require('rabbit.js').createContext(process.env.RabbitMQUrl);
    var sub = context.socket('SUBSCRIBE');
    sub.connect('bots');
    sub.setEncoding('utf8');
    sub.on('data', function(note) {
        var botData = JSON.parse(note);
        robot.send(admin_data,"There're new user installing your Bot! : "+botData.team_name);
        newBot(botData, robot);
    });
	
	/*########## for Jenkins server ##########*/
	var context = require('rabbit.js').createContext(process.env.RabbitMQUrl);
    var sub = context.socket('SUBSCRIBE');
    sub.connect('exchangeString');
    sub.setEncoding('utf8');
    sub.on('data', function(note) {
        
        var json = JSON.parse(note);
        var result = "["+json.build_status+"] " + json.build_name + "'s build "+json.build_number+" just finished!";
        if(json.fail_count > 0) //代表有錯誤ㄛ
        {
            for(var i = 0; i < json.fail_case.length;i++)
            {
                var f_case = json.fail_case[i];
                result = result + "\n\tTestcase \""+f_case.name+"\" has some problems";
            }
            result = result + "\nCheck the details on Jenkins!\n" + json.build_url;
        }
        
        //全部bots丟下去就對了XD
        var bots = robot.brain.get('bots');
        for(var i = 0;i < bots.length; i++)
        {
            var bot = bots[i];
            bot.bot.postMessage(json.roomNumber, result.toString());  
        }
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
                        robot.send(admin_data,"("+bots[k].data.team_name+")Has new activity :");
                        hubotAnalyze(bots[k].bot, robot, data, bots[k].data.team_name);
                    }
                }
            }
        }

    });
}







