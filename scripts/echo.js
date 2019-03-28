module.exports = function(robot) {
  robot.hear(/(.*)/, function(response) {
	  response.send("@"+response.envelope.user.name+":"+response.match[0]);
  });
}