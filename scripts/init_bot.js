/**
* @param {object} data
*/

module.exports = function(robot) {
    var hubotAnalyze = require('./hubotAnalyze').hubotAnalyze;
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
                var tempBot = {bot:bot, token:token, name:name, data:botData[i]};
                bots.push(tempBot);
                robot.brain.set("bots", bots);
                console.log(bots);
				
                bots[i]["bot"].on('message', function(data) 
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
									robot.send(admin_data,"("+bots[k].data.team_name+")有新活動:");
									hubotAnalyze(bots[k].bot, robot, data, bots[k].data.team_name);
								}
							}
                        }
                    }

                });
            }
            db.close();
        });
    }); 
}