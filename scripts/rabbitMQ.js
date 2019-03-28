var amqp = require('amqplib/callback_api')
module.exports = function(robot) {
    amqp.connect('amqp://140.121.196.23:4111', function (err, conn) 
    {
      conn.createChannel(function (err, ch) 
      {
        var q = 'hello'
        ch.assertQueue(q, {durable: false})
        console.log("Wating for message in %s. To exit press CTRL+C", q)
        ch.consume(q, function (msg) {
          console.log("Received %s", msg.content.toString())
		  var user_data = { "room": "D9PCFGPH9", "user_id": 'handsome841206'};
          robot.send(user_data,"Received : "+msg.content.toString())
        }, {noAck: true})
      })
    })
}



