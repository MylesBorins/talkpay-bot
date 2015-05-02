'use strict';

var Twit = require('twit');
var config = require('./local.json');

var T = new Twit(config);

var stream = T.stream('user');

function callbackHandler(id) {
  T.post('direct_messages/destroy', {
    id: id
  }, function (err) {
    if (err) { console.error(err); }
  });
}

stream.on('direct_message', function (eventMsg) {
  var msg = eventMsg.direct_message.text;
  var screenName = eventMsg.direct_message.sender.screen_name;
  var msgID = eventMsg.direct_message.id_str;
  
  if (screenName === 'talkpayBot') {
    return callbackHandler(msgID);
  }

  else if (msg.search('#talkpay') !== -1) {
    return T.post('statuses/update', {
      status: msg
    }, function () {
      callbackHandler(msgID);
    });
  }

  else {
    return T.post('direct_messages/new', {
      screen_name: screenName,
      text: 'ruhroh, you need to include #talkpay in your DM for me to do my thang'
    }, function () {
      callbackHandler(msgID);
    });
  }
});
