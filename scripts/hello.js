module.exports = function(robot) {
  robot.hear(/(Hello|hello|Hi|hi|你好|安安|早安|午安|晚安|哈囉|安)/, function(response) {
    re = ['Hello', 'hello', 'Hi', 'hi', '你好', '你好啊', '安安', '哈囉','你期待我回覆你什麼？','你以為我是打招呼機器人嗎？','好','打招呼？好',response.match[1]];
    response.send("@"+response.envelope.user.name+":"+response.random(re));
  });
}