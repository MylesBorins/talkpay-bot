// Inspired by twitter-autohook
// https://github.com/twitterdev/autohook
// MIT
'use strict';
const http = require('http');
const url = require('url');

const validateWebhook = require('./routes/validate-webhook');
const handleWebhook = require('./routes/handle-webhook');

const port = process.env.PORT || 8000;

const auth = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

const server = http.createServer(async (req, res) => {
  console.log(`request received for: ${req.url}`);

  const route = url.parse(req.url, true);
  if (route.query.crc_token) {
    validateWebhook(auth, route.query.crc_token, res);
    return;
  }

  if (req.method === 'POST' && req.headers['content-type'] === 'application/json') {
    try {
      await handleWebhook(auth, req);
      res.writeHead(200)
    }
    catch (e) {
      console.error(e);
      res.writeHead(500);
    }
    finally {
      res.end();
    }
    return;
  }

  if (req.url !== '/') {
    res.writeHead(404);
    res.write('404\'d');
    res.end();
    return;
  }
  
  res.writeHead(200);
  res.write('Oh hi');
  res.end();
});

module.exports = {
  server
};

if (require.main === module) {
  server.listen(port, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Lisenting on port ${port}`);
  });
}
