module.exports = function(robot) {
    var context = require('rabbit.js').createContext('amqp://140.121.196.23:4111');
    var sub = context.socket('SUBSCRIBE');
    sub.connect('exchangeString');
    sub.setEncoding('utf8');
    sub.on('data', function(note) {
        
        var json = JSON.parse(note);
        
        //先確定是哪個Team的消息，拿到所有bots
        var bots = robot.brain.get('bots');
        for(var i = 0;i < bots.length; i++)
        {
            var bot = bots[i];
                
            robot.http("https://slack.com/api/channels.list?token="+bots[i][4]+"&bot="+bots[i][2]).get()((err, res, body) =>
            {   
                var admin_data = { "room": "D9PCFGPH9", "user_id": "handsome841206"};
                var list = JSON.parse(body).channels;
                for(var y = 0; y < list.length;y++)
                {
                    if(json.roomNumber == list[y].id)//確定是這個Team的
                    {
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
                        bot[0].postMessage(json.roomNumber, result.toString()); 
                        robot.send(admin_data,"("+bot[3]+")發送Jenkins通知成功");
                        return;
                    }
                }
            });
        }
    });
}







