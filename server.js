// Inspired by twitter-autohook
// https://github.com/twitterdev/autohook
// MIT
'use strict';
const crypto = require('crypto');
const http = require('http');
const url = require('url');

const BufferList = require('bl');

const { dm, tweet } = require('./lib');

const port = process.env.PORT || 8000;

const auth = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

const moderator = process.env.USER_ID;

function validateWebhook(token, res) {
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

async function handleDM(m) {
  if (m.type !== 'message_create') return;
  console.log('direct message received');
  const msg = m.message_create.message_data.text;
  const senderId = m.message_create.sender_id;
  const receiverId = m.message_create.target.recipient_id;
  const msgID = m.id;
  const urls = m.message_create.message_data.entities.urls;

  await dm.destory(auth, msgID);
  console.log('direct message destroyed')

  let responseID;

  // if the message is from itself do nothing
  if (senderId === receiverId) {
    return;
  }

  // if the message is from a moderator and includes #shitbird delete the referenced tweet
  // share a tweet via DM with #shitbird
  // msg = ['#shitbird', 'http://t.co/someshortthing']
  // we need the full url though to extract the msgID we want to delete
  else if (senderId === moderator && msg.startsWith('#shitbird')) {
    const id = msg.slice(10);
    await tweet.destory(auth, id);
    const responseID = await dm.send(auth, senderId, 'Moderated.');

  }

  // No sharing links
  else if (urls.length) {
    const responseID = await dm.send(auth, senderId, 'Sorry, I will not send out messages that include links.', senderId, msgID);
  }

  // if the message includes #talkpay tweet it
  else if (msg.search('#talkpay').includes('#talkpay')) {
    const tweetID = await tweet.update(auth, msg);
    const responseID = await dm.send(auth, senderId, 'I\'ve. shared your salary information and deleted all messages. Thanks for sharing 🎉');
  }

  // if all else fails warn the messanger of what they need to do
  else {
    const responseID = await dm.send(auth, senderId, 'You need to include #talkpay in your DM for me to do my thing');
  }
  
  if (responseID) await dm.destory(auth, responseID);
}

async function handleWebhook(req) {
  const dataBuffer = new BufferList();
  req.on('data', chunk => {
    dataBuffer.append(chunk);
  });
  req.on('end', async () => {
    const result = JSON.parse(dataBuffer.toString());
    const dms = result['direct_message_events'];
    if (dms) {
      await Promise.all(dms.map(handleDM));
    }
  });
}

const server = http.createServer((req, res) => {
  console.log(`request received for: ${req.url}`);

  const route = url.parse(req.url, true);
  if (route.query.crc_token) {
    validateWebhook(route.query.crc_token, res);
    return;
  }

  if (req.method === 'POST' && req.headers['content-type'] === 'application/json') {
    try {
      await handleWebhook(req);
      res.writeHead(200)
    }
    catch (e) {
      console.error(e);
      res.writeHead(500);
    }
    finally {
      res.end();
    }
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

server.listen(port, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Lisenting on port ${port}`);
});
