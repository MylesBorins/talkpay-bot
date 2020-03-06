const crypto = require('crypto');

function validateWebhook(auth, token, res) {
  console.log('Validating Webhook');
  const responseToken = crypto
    .createHmac('sha256', auth.consumer_secret)
    .update(token)
    .digest('base64');
  res.writeHead(200, {'content-type': 'application/json'});
  res.end(JSON.stringify({
    response_token: `sha256=${responseToken}`
  }));
}

module.exports = validateWebhook;
