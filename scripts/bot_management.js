/**
 * @param {object} data
 */

module.exports = function(robot) {
    robot.hear(/(列出所有機器人)/, function(response) 
    {
        
        var bots = robot.brain.get('bots');
        response.send("是的！這邊是所有的機器人資料！目前總共有"+bots.length+"個機器人 : ");
        for(var i = 0;i < bots.length; i++)
        {
            response.send("第"+(i+1)+"個Bot屬於 :" + bots[i].data.team_name);
        }
    });
  
    robot.hear(/(列出所有頻道)\s(.*)/, function(response) 
    {
        var bots = robot.brain.get('bots');
        var team = response.match[2];
        response.send("好的！搜尋中！");
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
                        result += "頻道 : " + json.channels[i].id +" / "+ json.channels[i].name +"\n";
                    }
                    response.send(result);
                });
            //var list = bot.getUsers();
            }
        }
    });
  
    robot.hear(/(機器人公告)\s(.*)/, function(response) 
    {
        var bots = robot.brain.get('bots');
        var result = response.match[2];
        for(var i = 0;i < bots.length; i++)
        {
            bots[i].bot.postTo('general', "開發者公告："+result);
        }
        response.send("發送完畢！");
    });
  
    robot.hear(/(機器人重新啟動)/, function(response) 
    {
        var bot = require('./bot');
        //response.send("收到！開始重啟機器人！");
        bot.reset_bot(robot);
    });

}