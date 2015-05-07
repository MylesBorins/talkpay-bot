'use strict';

// This callback handler will delete the direct message with the
// id that is provided to it. This function is always called
function cleanup(T, id) {

  T.post('direct_messages/destroy', {
    id: id
  }, function (err) {

    if (err) { return console.error(err); }
  });
}

module.exports = cleanup;
