'use strict';
const fetch = require('node-fetch');

const { createOAuthHeader } = require('./auth/oauth');

const { encode } = require('./util');

const POST_URL = 'https://api.twitter.com/1.1/statuses/update.json';
const DELETE_URL = 'https://api.twitter.com/1.1/statuses/destroy/';

async function update(auth, msg) {
  const requestData = {
    url: `${POST_URL}?status=${encode(msg)}`,
    method: 'POST'
  };

  const res = await fetch(requestData.url, {
    headers: createOAuthHeader(auth, requestData),
    method: requestData.method
  });
  // if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.id_str;
}

async function destroy(auth, id) {
  // const bearer = await 
  const requestData = {
    url: `${DELETE_URL}${id}.json`,
    method: 'POST'
  };

  const res = await fetch(requestData.url, {
    headers: createOAuthHeader(auth, requestData),
    method: requestData.method
  });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return true;
}

module.exports = {
  update,
  destroy
};
