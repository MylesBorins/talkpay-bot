'use strict';

var regex = new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?');

function linkCheck(msg) {
  return regex.test(msg);
}

module.exports = linkCheck;
