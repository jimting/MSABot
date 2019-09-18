module.exports = function(robot) {
    var context = require('rabbit.js').createContext('amqp://140.121.196.23:4111');
    var sub = context.socket('SUBSCRIBE');
    sub.connect('exchangeString');
    sub.setEncoding('utf8');
    sub.on('data', function(note) {
        
        var json = JSON.parse(note);
        var result = "["+json.build_status+"] " + json.build_name + "'s build "+json.build_number+" just finished!";
        if(json.fail_count > 0) //代表有錯誤ㄛ
        {
            for(var i = 0; i < json.fail_case.length;i++)
            {
                var f_case = json.fail_case[i];
                result = result + "\n\tTestcase \""+f_case.name+"\" has some problems";
            }
            result = result + "\nCheck the details on Jenkins!\n" + json.build_url;
        }
        
        //全部bots丟下去就對了XD
        var bots = robot.brain.get('bots');
        for(var i = 0;i < bots.length; i++)
        {
            var bot = bots[i];
            bot.bot.postMessage(json.roomNumber, result.toString());  
        }
    });
}







