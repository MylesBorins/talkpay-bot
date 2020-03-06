const crypto = require('crypto');

function validateWebhook(auth, token, res) {
  console.log('Validating Webhook');
  try {
    const responseToken = crypto
      .createHmac('sha256', auth.consumer_secret)
      .update(token)
      .digest('base64');
    res.writeHead(200, {'content-type': 'application/json'});
    res.write(JSON.stringify({
      response_token: `sha256=${responseToken}`
    }))
    res.end();
  }
  catch (e) {
    console.error(e);
    res.writeHead(500);
    res.write('500: Something went seriously wrong.')
    res.end();
  }
}

module.exports = validateWebhook;
