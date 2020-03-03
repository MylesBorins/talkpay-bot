'use strict';

// native moduoles
const {basename} = require('path');

// npm installed modules
const request = require('request');

// local modules
const cleanup = require('./cleanup');

function moderate(T, msg, msgID) {
  let badApple;
  // this needs to be in a try catch in case the second part of the message is not a url
  try {
    return request(msg.split(' ')[1], function (err, response) {

      if (err) {
        return cleanup(T, msgID);
      }

      badApple = basename(response.request.uri.pathname);

      return T.post('statuses/destroy/:id', {
        id: badApple
      }, function () {

        return cleanup(T, msgID);
      });
    });
  }
  catch (e) {
    return cleanup(T, msgID);
  }
}

module.exports = moderate;
