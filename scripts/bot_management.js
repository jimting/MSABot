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
        response.send("第"+(i+1)+"個Bot : " + bots[i][2] + " / 屬於 :" + bots[i][3]);
    }
  });
  
  robot.hear(/(列出所有頻道)\s(.*)/, function(response) 
  {
    var bots = robot.brain.get('bots');
    var team = response.match[2];
    response.send("好的！搜尋中！");
    for(var i = 0;i < bots.length; i++)
    {
        if(bots[i][3] == team)
        {
            robot.http("https://slack.com/api/channels.list?token="+bots[i][4]+"&bot="+bots[i][2]).get()((err, res, body) =>
            {
                response.send(body);
            });
            //var list = bot.getUsers();
        }
    }
  });
  
  robot.hear(/(列出所有使用者)\s(.*)/, function(response) 
  {
    var bots = robot.brain.get('bots');
    var team = response.match[2];
    response.send("好的！搜尋中！");
    for(var i = 0;i < bots.length; i++)
    {
        if(bots[i][3] == team)
        {
            var bot = bots[i][0];
            var list = bot.getUsers(bots[i][4]);
            response.send(list);
        }
    }
  });
}