const fetch = require('node-fetch');
const Headers = fetch.Headers;

const {createBasicHeader} = require('./basic');

const bearerUrl = 'https://api.twitter.com/oauth2/token';

const params = new URLSearchParams();
params.append('grant_type', 'client_credentials');

let _token;

async function getBearerToken(auth) {
  if (_token) return _token;
  const res = await fetch(bearerUrl, {
    method: 'post',
    body: params,
    headers: createBasicHeader(auth)
  });
  const {
    token_type,
    access_token
  } = await res.json();
  if (token_type !== 'bearer') throw new Error(`wrong token type: ${token_type}`);
  return access_token;
}

async function createBearerHeader(auth) {
  const token = await getBearerToken(auth);
  return new Headers({
    Authorization: `Bearer ${_token}`
  });
}

module.exports = {
  getBearerToken,
  createBearerHeader
};
