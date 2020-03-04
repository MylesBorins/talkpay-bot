const fetch = require('node-fetch');
const Headers = fetch.Headers;

const { createOAuthHeader } = require('./auth/oauth');

function bearerHeader(bearer) {
  return new Headers({
    Authorization: `Bearer ${bearer}`
  });
}

async function deleteWebhook(bearer, env, id) {
  const deleteUrl = `https://api.twitter.com/1.1/account_activity/all/${env}/webhooks/${id}.json`
  const res = await fetch(deleteUrl, {
    method: 'delete',
    headers: bearerHeader(bearer)
  });
  return res;
}

async function getWebhooks(bearer, env) {
  const getUrl = `https://api.twitter.com/1.1/account_activity/all/${env}/webhooks.json`;
  const res = await fetch(getUrl, {
    headers: bearerHeader(bearer)
  });
  const json = await res.json();
  return json;
}

async function registerWebhook(auth, env, url) {
  const endpoint = new URL(`https://api.twitter.com/1.1/account_activity/all/${env}/webhooks.json`);
  endpoint.searchParams.append('url', url);
  const requestData = {
    url: endpoint.toString(),
    method: 'POST'
  };
  const res = await fetch(requestData.url, {
    headers: createOAuthHeader(auth, requestData),
    method: requestData.method
  });
  if (!res.ok) throw new Error(res.statusText);
  const json = await res.json();
  return json;
}

async function subscribe(auth, env) {
  const requestData = {
    url: `https://api.twitter.com/1.1/account_activity/all/${env}/subscriptions.json`,
    method: 'POST'
  };
  const res = await fetch(requestData.url, {
    headers: createOAuthHeader(auth, requestData),
    method: requestData.method
  });
  if (!res.ok) throw new Error(res.statusText);
  return true;
}

module.exports = {
  deleteWebhook,
  getWebhooks,
  registerWebhook,
  subscribe
};
