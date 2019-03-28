module.exports = function(robot) {
  robot.hear(/(天氣|weather)/, function(response) 
  {
	  //隨便爬蟲
	var request = require("request");
	var fs = require("fs");
	var cheerio = require("cheerio");
	request({
		url: "https://www.cwb.gov.tw/V7/forecast/txt/w01.htm",
		method: "GET"
	}, function(e,r,b) {
    if(e || !b) { return; }
    var $ = cheerio.load(b);
    var result = [];
    var titles = $("pre");
    for(var i=0;i<titles.length;i++) 
	{
		result.push($(titles[i]).text());
    }
	
	response.send(result + "\n");
	
	});
    
  });
}