'use strict';

const cleanup = require('./cleanup');
const fetch = require('node-fetch');

// If we are not posting, let the user know and delete the message
async function returnToSender(auth, T, text, recipient_id, msgID) {
  const endpoint = 'https://api.twitter.com/1.1/direct_messages/events/new.json';
  const data = {
    event: {
      type: 'message_create',
      mesage_create: {
        target: {
          recipient_id
        },
        message_data: {
          text
        }
      }
    }
  };
  const requestData = {
    url: endpoint,
    data,
    method: 'POST'
  };
  const consumerToken = {
    key: auth.consumer_key,
    secret: auth.consumer_secret,
  };
  const accessToken = {
    key: auth.access_token.trim(),
    secret: auth.access_token_secret.trim()
  };
  const res = await fetch(requestData.url, {
    headers: createOAuthHeader(consumerToken, accessToken, requestData)
      .append('Content-Type', 'application/json'),
    method: requestData.method,
    body: JSON.stringify(requestData.data)
  });
  if (!res.ok) throw new Error(res.statusText);
  const json = await res.json();
  return cleanup(T, msgID);
  
  // return T.post('direct_messages/events/new', {
  //   target: {
  //     recipient_id
  //   },
  //   message_data: {
  //     text
  //   }
  // }, function () {
  //   return cleanup(T, msgID);
  // });
}

module.exports = returnToSender;
