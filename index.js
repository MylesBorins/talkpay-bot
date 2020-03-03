'use strict';

// npm modules
var Twit = require('twit');

// local modules
var linkCheck = require('./lib/link-check');
var post = require('./lib/post');
var cleanup = require('./lib/cleanup');
var returnToSender = require('./lib/return-to-sender');
var moderate = require('./lib/moderate');

// local data
var config = require('./local.json');
var moderators = require('./moderators.json');

var T = new Twit(config);

var stream = T.stream('user');

stream.on('direct_message', function (eventMsg) {

  var msg = eventMsg.direct_message.text;
  var screenName = eventMsg.direct_message.sender.screen_name;
  var msgID = eventMsg.direct_message.id_str;

  // if the message is from itself just delete it
  if (screenName === 'talkpayBot') {
    return cleanup(T, msgID);
  }

  // if the message is from a moderator and includes #shitbird delete the referenced tweet
  // share a tweet via DM with #shitbird
  // msg = ['#shitbird', 'http://t.co/someshortthing']
  // we need the full url though to extract the msgID we want to delete
  else if (moderators.includes(screenName) && msg.search('#shitbird') !== -1) {
    return moderate(T, msg, msgID);
  }

  else if (linkCheck(msg)) {
    return returnToSender(T, 'Sorry, I will not send out messages that include links.', screenName, msgID);
  }

  // if the message includes #talkpay tweet it
  else if (msg.search('#talkpay') !== -1) {
    return post(T, msg, msgID);
  }

  // if all else fails warn the messanger of what they need to do
  else {
    return returnToSender(T, 'ruhroh, you need to include #talkpay in your DM for me to do my thang', screenName, msgID);
  }
});
