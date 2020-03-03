const fetch = require('node-fetch');

const { createOAuthHeader } = require('./auth/oauth');

const POST_URL = 'https://api.twitter.com/1.1/direct_messages/events/new.json';
const DELETE_URL = 'https://api.twitter.com/1.1/direct_messages/events/destroy.json';

function createDmEvent(recipient_id, text) {
  return '{"event":{"type": "message_create", "message_create": {"target": ' + 
          `{"recipient_id": "${recipient_id}"}, "message_data": {"text": "${text}"}}}}`;
}

async function send(auth, recipient_id, text) {
  const requestData = {
    url: POST_URL,
    method: 'POST'
  };

  const headers = createOAuthHeader(auth, requestData);
  headers.append('Content-type', 'application/json');

  const body = createDmEvent(recipient_id, text);

  const res = await fetch(requestData.url, {
    headers,
    method: requestData.method,
    body
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.event;
}

async function destroy(auth, id) {
  const requestData = {
    url: `${DELETE_URL}?id=${id}`,
    method: 'DELETE'
  };
  
  const res = await fetch(requestData.url, {
    headers: createOAuthHeader(auth, requestData),
    method: requestData.method
  });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return true;
}

module.exports = {
  send,
  destroy
};
