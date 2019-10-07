module.exports = function(robot) {
  robot.hear(/(analyze)\s(.*)/, function(response) {
    var analyze_string = response.match[2];
	var request = require('request');

	var options = {
	  uri: process.env.RasaUrl + '/webhooks/rest/webhook',
	  method: 'POST',
	  json: 
	  {
		"message": analyze_string
	  }
	};
	
	request(options, function (error, res, body) 
	{
	  if (!error && res.statusCode == 200) 
	  {
		console.log(body);
		response.send("@"+response.envelope.user.name+":"+body[0].text);
	  }
	  if(error)
		response.send("[error] @"+response.envelope.user.name+":"+error);
	});

   
  });
}