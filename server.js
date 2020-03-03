// Inspired by twitter-autohook
// https://github.com/twitterdev/autohook
// MIT
'use strict';
const crypto = require('crypto');
const http = require('http');
const url = require('url');

const BufferList = require('bl');
const Twit = require('twit');

const cleanup = require('./lib/cleanup');
const moderate = require('./lib/moderate');
const post = require('./lib/post');
const returnToSender = require('./lib/return-to-sender');

const port = process.env.PORT || 8000;

const auth = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

const moderator = process.env.USER_ID;

let T;

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

async function handleDM(dm) {
  if (!T) T = new Twit(auth);
  console.log('direct message received');
  if (dm.type !== 'message_create') return;
  const msg = dm.message_create.message_data.text;
  const senderId = dm.message_create.sender_id;
  const receiverId = dm.message_create.target.recipient_id;
  const msgID = dm.id;
  const urls = dm.message_create.message_data.entities.urls;

  // if the message is from itself just delete it
  if (senderId === receiverId) {
    return cleanup(T, msgID);
  }

  // if the message is from a moderator and includes #shitbird delete the referenced tweet
  // share a tweet via DM with #shitbird
  // msg = ['#shitbird', 'http://t.co/someshortthing']
  // we need the full url though to extract the msgID we want to delete
  else if (senderId === moderator && msg.search('#shitbird') !== -1) {
    return moderate(T, msg, msgID);
  }

  // No sharing links
  else if (url.length) {
    return await returnToSender(T, 'Sorry, I will not send out messages that include links.', senderId, msgID);
  }

  // if the message includes #talkpay tweet it
  else if (msg.search('#talkpay') !== -1) {
    return post(T, msg, msgID);
  }

  // if all else fails warn the messanger of what they need to do
  else {
    return await returnToSender(T, 'You need to include #talkpay in your DM for me to do my thing', senderId, msgID);
  }
}

async function handleWebhook(req, res) {
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
    res.writeHead(200);
    res.end();
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
    handleWebhook(req, res);
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

server.listen(port, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Lisenting on port ${port}`);
});
