'use strict';

var path = require('path');
var basename = path.basename;

var request = require('request');
var Twit = require('twit');

var config = require('./local.json');
var moderators = require('./moderators.json');
var includes = require('lodash.includes');

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
  var badApple;

  if (screenName === 'talkpayBot') {
    return callbackHandler(msgID);
  }

  else if (includes(moderators, screenName) && msg.search('#shitbird') !== -1) {

    // share a tweet via DM with #shitbird
    // msg = ['#shitbird', 'http://t.co/someshortthing']
    // we need the full url though to extract the msgID we want to delete
    try {

      return request(msg.split(' ')[1], function (err, response) {
        if (err) {
          return callbackHandler(msgID);
        }

        badApple = basename(response.request.uri.pathname);

        return T.post('statuses/destroy/:id', {
          id: badApple
        }, function () {

          return callbackHandler(msgID);
        });
      });
    }
    catch (e) {
      return callbackHandler(msgID);
    }
  }

  else if (msg.search('#talkpay') !== -1) {

    return T.post('statuses/update', {
      status: msg
    }, function () {

      return callbackHandler(msgID);
    });
  }

  else {
    return T.post('direct_messages/new', {

      screen_name: screenName,
      text: 'ruhroh, you need to include #talkpay in your DM for me to do my thang'
    }, function () {

      return callbackHandler(msgID);
    });
  }
});
