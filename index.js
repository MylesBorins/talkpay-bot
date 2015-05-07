'use strict';

// native modules
var path = require('path');
var basename = path.basename;

// npm modules
var request = require('request');
var Twit = require('twit');
var sanitizer = require('sanitizer');
var includes = require('lodash.includes');

// local data / modules
var linkCheck = require('./lib/link-check');
var config = require('./local.json');
var moderators = require('./moderators.json');

var T = new Twit(config);

var stream = T.stream('user');

// This callback handler will delete the direct message with the
// id that is provided to it. This function is always called
function callbackHandler(id) {

  T.post('direct_messages/destroy', {
    id: id
  }, function (err) {

    if (err) { return console.error(err); }
  });
}

// If we are not posting, let the user know and delete the message
function returnToSender(text, screenName, msgID) {
  return T.post('direct_messages/new', {
    screen_name: screenName,
    text: text
  }, function () {

    return callbackHandler(msgID);
  });
}

function moderate(msg, msgID) {
  var badApple;
  // this needs to be in a try catch in case the second part of the message is not a url
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

stream.on('direct_message', function (eventMsg) {

  var msg = eventMsg.direct_message.text;
  var screenName = eventMsg.direct_message.sender.screen_name;
  var msgID = eventMsg.direct_message.id_str;

  // if the message is from itself just delete it
  if (screenName === 'talkpayBot') {
    return callbackHandler(msgID);
  }

  // if the message is from a moderator and includes #shitbird delete the referenced tweet
  // share a tweet via DM with #shitbird
  // msg = ['#shitbird', 'http://t.co/someshortthing']
  // we need the full url though to extract the msgID we want to delete
  else if (includes(moderators, screenName) && msg.search('#shitbird') !== -1) {
    return moderate(msg, msgID);
  }

  else if (linkCheck(msg)) {
    return returnToSender('Sorry, I will not send out messages that include links.', screenName, msgID);
  }

  // if the message includes #talkpay tweet it
  else if (msg.search('#talkpay') !== -1) {
    return T.post('statuses/update', {
      // sanitizer removes HTML Special Characters
      status: sanitizer.unescapeEntities(msg)
    }, function () {

      return callbackHandler(msgID);
    });
  }

  // if all else fails warn the messanger of what they need to do
  else {
    return returnToSender('ruhroh, you need to include #talkpay in your DM for me to do my thang', screenName, msgID);
  }
});
