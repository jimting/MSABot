module.exports = function(robot) {
    var context = require('rabbit.js').createContext('amqp://140.121.196.23:4111');
    var sub = context.socket('SUBSCRIBE');
    sub.connect('exchangeString');
    sub.setEncoding('utf8');
    sub.on('data', function(note) {
        
        var json = JSON.parse(note);
        var result = "[公告]專案 " + json.build_name + "第"+json.build_number+"次建置剛剛執行了！建置結果："+json.build_status;
        if(json.fail_count > 0) //代表有錯誤ㄛ
        {
            for(var i = 0; i < json.fail_case.length;i++)
            {
                var f_case = json.fail_case[i];
                result = result + "\n\t測試案例 \""+f_case.name+"\"有問題";
            }
            result = result + "\n詳細錯誤情形請到您的Jenkins查看\n" + json.build_url;
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







