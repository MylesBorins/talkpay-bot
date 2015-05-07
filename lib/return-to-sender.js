'use strict';

var cleanup = require('./cleanup');

// If we are not posting, let the user know and delete the message
function returnToSender(T, text, screenName, msgID) {
  return T.post('direct_messages/new', {
    screen_name: screenName,
    text: text
  }, function () {

    return cleanup(T, msgID);
  });
}

module.exports = returnToSender;
