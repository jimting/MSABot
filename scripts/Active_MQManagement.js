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
		var bot = require('./MSABot');
		var token = botData.bot_access_token;
		var name = "MSABot";
		var team = botData.team_name;
		bot.newBot(token, name, robot, team_name);
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
	
	/*########## for eureka server ##########*/
    var context = require('rabbit.js').createContext(process.env.RabbitMQUrl);
    var sub = context.socket('SUBSCRIBE');
    sub.connect('eurekaserver');
    sub.setEncoding('utf8');
    sub.on('data', function(note) {
        var json = JSON.parse(note);
		var result = "["+json.status+"] Your service " + json.appName + " on Eureka Server had some activities.";
       
		var bots = robot.brain.get('bots');
		for(var i = 0;i < bots.length; i++)
        {
            var bot = bots[i];
            bot.bot.postMessage(json.roomID, result.toString());  
        }
    });
	
	/*########## for VMAMV server ##########*/
    var context = require('rabbit.js').createContext(process.env.RabbitMQUrl);
    var sub = context.socket('SUBSCRIBE');
    sub.connect('vmamv');
    sub.setEncoding('utf8');
    sub.on('data', function(note) {
        var json = JSON.parse(note);
		var result = "["+json.status+"] " + json.content;
       
		var bots = robot.brain.get('bots');
		for(var i = 0;i < bots.length; i++)
        {
            var bot = bots[i];
            bot.bot.postMessage(json.roomID, result.toString());  
        }
    });
}





