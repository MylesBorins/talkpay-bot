'use strict';

var Twit = require('twit');
var config = require('./local.json');

var T = new Twit(config);

var stream = T.stream('user');

stream.on('direct_message', function (eventMsg) {
  var msg = eventMsg.direct_message.text;

  if (msg.search('#talkpay') !== -1) {
    T.post('statuses/update', { status: msg }, function (err, data) {
      if (err) {
        return console.error(new Error(err));
      }
      return console.log(data);
    });
  }
});
