const fetch = require('node-fetch');
const Headers = fetch.Headers;

const bearerUrl = 'https://api.twitter.com/oauth2/token';

const params = new URLSearchParams();
params.append('grant_type', 'client_credentials');

function basicHeader(auth) {
  return new Headers({
    Authorization: 'Basic '
      + Buffer.from(`${auth.user}:${auth.pass}`, 'utf8').toString('base64')
  });
}

let _token;

async function getBearerToken(auth) {
  if (_token) return _token;
  const res = await fetch(bearerUrl, {
    method: 'post',
    body: params,
    headers: basicHeader(auth)
  });
  const {
    token_type,
    access_token
  } = await res.json();
  if (token_type !== 'bearer') throw new Error(`wrong token type: ${token_type}`);
  return access_token;
}

async function getBearerHeader(auth) {
  if (!_token) token = await getBearerToken(auth);
  if (!_bearerHeader) _bearerHeader = new Headers({
    Authorization: `Bearer ${_token}`
  });
  return _bearerHeader;
}

module.exports = {
  getBearerToken,
  getBearerHeader
};
