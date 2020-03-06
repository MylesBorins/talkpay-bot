// Inspired by twitter-autohook
// https://github.com/twitterdev/autohook
// MIT
'use strict';
const http = require('http');
const url = require('url');

const BufferList = require('bl');

const { dm, tweet } = require('./lib');

const validateWebhook = require('./routes/validate-webhook');

const port = process.env.PORT || 8000;

const auth = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

const moderatorID = process.env.MODERATOR_ID;
const botID = process.env.BOT_ID;

async function handleDM(m) {
  if (m.type !== 'message_create') return;
  console.log('direct message received');

  const msg = m.message_create.message_data.text;
  const senderId = m.message_create.sender_id;
  const receiverId = m.message_create.target.recipient_id;
  const msgID = m.id;
  const urls = m.message_create.message_data.entities.urls;
  
  await dm.destroy(auth, msgID);
  console.log('direct message destroyed');

  // if the message is from itself do nothing
  if (senderId === botID) {
    return;
  }

  // if the message is from a moderator and includes #shitbird delete the referenced tweet
  // share a tweet via DM with #shitbird
  // msg = ['#shitbird', 'http://t.co/someshortthing']
  // we need the full url though to extract the msgID we want to delete'
  if (senderId == moderatorID && msg.startsWith('#cleanup')) {
    const target = urls[0].expanded_url;
    const split = target.split('/');
    const id = split[split.length - 1];
    try {
      await tweet.destroy(auth, id);
      await dm.send(auth, senderId, 'Moderated.');
    }
    catch (e) {
      console.error(e);
      await dm.send(auth, senderId, 'Something went wrong 😢.');
    }
  }

  // No sharing links
  else if (urls.length) {
    await dm.send(auth, senderId, 'Sorry, I will not send out messages that include links.', senderId, msgID);
  }

  // if the message includes #talkpay tweet it
  else if (msg.includes('#talkpay')) {
    try {
      const tweetID = await tweet.update(auth, msg);
      await dm.send(auth, senderId, 'I\'ve shared your salary information and deleted all messages. Thanks for sharing 🎉');
    }
    catch (e) {
      console.error(e);
      await dm.send(auth, senderId, 'Something went wrong, please try again.');
    }
  }

  // if all else fails warn the messanger of what they need to do
  else {
    await dm.send(auth, senderId, 'You need to include #talkpay in your DM for me to do my thing');
  }
}

async function handleWebhook(req) {
  console.log('handling webhook')
  const dataBuffer = new BufferList();
  req.on('data', chunk => {
    dataBuffer.append(chunk);
  });
  req.on('end', async () => {
    const result = JSON.parse(dataBuffer.toString());
    const dms = result['direct_message_events'];
    if (dms && dms.length) {
      try {
        await Promise.all(dms.map(handleDM));
      }
      catch (e) {
        console.error(e);
      }
    }
  });
}

const server = http.createServer(async (req, res) => {
  console.log(`request received for: ${req.url}`);

  const route = url.parse(req.url, true);
  if (route.query.crc_token) {
    validateWebhook(auth, route.query.crc_token, res);
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

if (require.main === module) {
  server.listen(port, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Lisenting on port ${port}`);
  });
}

module.exports = {
  server
};
