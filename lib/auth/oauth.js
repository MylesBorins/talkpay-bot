const crypto = require('crypto');
const OAuth = require('oauth-1.0a')
const fetch = require('node-fetch');
const Headers = fetch.Headers;

function createTokens(auth) {
  const consumerToken = {
    key: auth.consumer_key.trim(),
    secret: auth.consumer_secret.trim()
  };

  const accessToken = {
    key: auth.access_token.trim(),
    secret: auth.access_token_secret.trim()
  };

  return {
    accessToken,
    consumerToken
  };
}

function createOAuthHeader(auth, requestData) {
  const {
    accessToken,
    consumerToken
  } = createTokens(auth);

  const oauth = OAuth({
    consumer: consumerToken,
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto
        .createHmac('sha1', key)
        .update(base_string)
        .digest('base64');
    }
  });
  
  const header = oauth.toHeader(oauth.authorize(requestData, accessToken));
  return new Headers(header);
}

module.exports = {
  createOAuthHeader,
  createTokens
};
