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
                response.send(body);
            });
            //var list = bot.getUsers();
        }
    }
  });
  
  robot.hear(/(發送給所有頻道)\s(.*)/, function(response) 
  {
    var bots = robot.brain.get('bots');
    var result = response.match[2];
    for(var i = 0;i < bots.length; i++)
    {
        bots[i].bot.postTo('general', "開發者通知："+result);
    }
    response.send("發送完畢！");
  });

}