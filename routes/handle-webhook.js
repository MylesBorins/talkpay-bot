const BufferList = require('bl');

const { dm, tweet } = require('../lib');

const MODERATOR_ID = process.env.MODERATOR_ID;
const BOT_ID = process.env.BOT_ID;

async function moderate(auth, urls, senderId) {
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

async function talkpay(auth, msg, senderId) {
  try {
    const tweetID = await tweet.update(auth, msg);
    await dm.send(auth, senderId, 'I\'ve shared your salary information and deleted all messages. Thanks for sharing 🎉');
  }
  catch (e) {
    console.error(e);
    await dm.send(auth, senderId, 'Something went wrong, please try again.');
  }
}

async function handleDM(auth, m) {
  if (m.type !== 'message_create') return;
  console.log('direct message received');

  const msg = m.message_create.message_data.text;
  const senderId = m.message_create.sender_id;
  const receiverId = m.message_create.target.recipient_id;
  const msgID = m.id;
  const urls = m.message_create.message_data.entities.urls;

  // immediately destroy message we received
  await dm.destroy(auth, msgID);
  console.log('direct message destroyed');

  // if the message is from itself do nothing
  if (senderId === BOT_ID) {
    return;
  }
  // if the message is from a moderator and includes #shitbird delete the referenced tweet
  // share a tweet via DM with #shitbird
  // msg = ['#shitbird', 'http://t.co/someshortthing']
  // we need the full url though to extract the msgID we want to delete'
  if (senderId == MODERATOR_ID && msg.startsWith('#cleanup')) {
    await moderate(auth, urls, senderId);
  }
  // No sharing links
  else if (urls.length) {
    await dm.send(auth, senderId, 'Sorry, I will not send out messages that include links.', senderId, msgID);
  }
  // if the message includes #talkpay tweet it
  else if (msg.includes('#talkpay')) {
    await talkpay(auth, msg, senderId);
  }
  // if all else fails warn the messanger of what they need to do
  else {
    await dm.send(auth, senderId, 'You need to include #talkpay in your DM for me to do my thing');
  }
}

async function handleWebhook(auth, req) {
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
        await Promise.all(dms.map(message => {
          handleDM(auth, message);
        }));
      }
      catch (e) {
        console.error(e);
      }
    }
  });
}

module.exports = handleWebhook;
