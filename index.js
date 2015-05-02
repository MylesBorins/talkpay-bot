'use strict';

var Twit = require('twit');
var config = require('./local.json');

var T = new Twit(config);

var stream = T.stream('user');

function callbackHandler(err, data) {
  if (err) {
    return console.error(new Error(err));
  }
  return console.log(data);
}

stream.on('direct_message', function (eventMsg) {
  var msg = eventMsg.direct_message.text;
  var screenName = eventMsg.direct_message.sender.screen_name;
  
  if (screenName === 'talkpayBot') {
    return;
  }

  else if (msg.search('#talkpay') !== -1) {
    T.post('statuses/update', {
      status: msg
    }, callbackHandler);
  }

  else {
    T.post('direct_messages/new', {
      screen_name: screenName,
      text: 'ruhroh, you need to include #talkpay in your DM for me to do my thang'
    }, callbackHandler);
  }
});
