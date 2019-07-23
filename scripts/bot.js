/**
 * @param {object} data
 */

module.exports = function(robot) {
  robot.hear(/(新連線)\s(.*)\s(.*)\s(.*)\s(.*)/, function(response) {
        
    var SlackBot = require('slackbots');
    var bots = robot.brain.get('bots');
    if(bots == null)
        bots = [];
    var token = response.match[2];
	var auth_token = response.match[3];
    var name = response.match[4];
	var team = response.match[5];
    // create a bot
    var bot = new SlackBot({
        token: token, // Add a bot https://my.slack.com/services/new/bot and put the token 
        name: name
    });

    bot.on('message', function(data) {
       if(data.type!="error")
          console.log(data);
       // more information about additional params https://api.slack.com/methods/chat.postMessage
       if(data.type=="message")
       {
          if(data.subtype!='bot_message')
          {
            //bot.postMessageToChannel('general', "@"+data.user+" : (對我說了) "+data.text); 
            response.send("其他聊天室有互動資料! : "+ JSON.stringify(data));
            hubotAnalyze(bot, response, data);
          }
       }
        
    });
    var tempBot = [bot, token, name, team, auth];
    bots.push(tempBot);
    robot.brain.set("bots", bots);
    console.log(bots);
  });
}
