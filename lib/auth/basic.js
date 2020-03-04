const { Headers } = require('node-fetch');

function createBasicHeader(auth) {
  return new Headers({
    Authorization: 'Basic '
      + Buffer.from(`${auth.consumer_key}:${auth.consumer_secret}`, 'utf8').toString('base64')
  });
}

module.exports = {
  createBasicHeader
};
