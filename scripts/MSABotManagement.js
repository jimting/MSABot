/**
 * @param {object} data
 */

module.exports = function(robot) {
    robot.hear(/(robot list)/, function(response) 
    {
        
        var bots = robot.brain.get('bots');
        response.send("Got it! Here you are! The total number of robots is "+bots.length+".");
        for(var i = 0;i < bots.length; i++)
        {
            response.send((i+1)+" : " + bots[i].data.team_name);
        }
    });
  
    robot.hear(/(robot listchannel)\s(.*)/, function(response) 
    {
        var bots = robot.brain.get('bots');
        var team = response.match[2];
        response.send("Got it! Searching...");
        for(var i = 0;i < bots.length; i++)
        {
            if(bots[i].data.team_name == team)
            {
                robot.http("https://slack.com/api/channels.list?token="+bots[i].data.access_token).get()((err, res, body) =>
                {
                    var json = JSON.parse(body);
                    var result = "";
                    for(var i = 0;i < json.channels.length;i++)
                    {
                        result += "Channel : " + json.channels[i].id +" / "+ json.channels[i].name +"\n";
                    }
                    response.send(result);
                });
            //var list = bot.getUsers();
            }
        }
    });
  
    robot.hear(/(robot announcement)\s(.*)/, function(response) 
    {
        var bots = robot.brain.get('bots');
        var result = response.match[2];
        for(var i = 0;i < bots.length; i++)
        {
            bots[i].bot.postTo('general', "[Announcement] : "+result);
        }
        response.send("Sending announcement successfully.");
    });
  
    robot.hear(/(robot restart)/, function(response) 
    {
        var bot = require('./MSABot');
        //response.send("收到！開始重啟機器人！");
        bot.reset_bot(robot);
    });

}