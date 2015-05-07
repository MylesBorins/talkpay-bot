'use strict';

// npm installed modules
var sanitizer = require('sanitizer');

// local modules
var cleanup = require('./cleanup');

function post(T, msg, msgID) {
  return T.post('statuses/update', {
    // sanitizer removes HTML Special Characters
    status: sanitizer.unescapeEntities(msg)
  }, function () {

    return cleanup(T, msgID);
  });
}

module.exports = post;
