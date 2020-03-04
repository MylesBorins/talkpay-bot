const {
  access_token,
  access_token_secret,
  consumer_key,
  consumer_secret,
  env,
  webhook_url
} = require('../local.json');

const {
  registerWebhook,
  getWebhooks,
  deleteWebhook,
  subscribe
} = require('../lib/webhooks');

const auth = {
  access_token,
  access_token_secret,
  consumer_key,
  consumer_secret
};

async function cleanOldWebhook(auth, env) {
  console.log('Getting existing webhook');
  const webhooks = await getWebhooks(auth, env);
  if (!webhooks instanceof Array) throw webhooks;
  const webhook = webhooks[0];
  if (webhook) {
    console.log(`webhook found`);
    console.log(webhook.url)
    console.log('Deleting webhook');
    const success = await deleteWebhook(auth, env, webhook.id);
    if (!success) throw new Error('webhook deletion failed');
    console.log('Successfully deleted webhook');
  }
  else {
    console.log('No webhook found');
  }
}

async function registerNewWebhook(auth, env, webhook_url) {
  console.log('Registering new webhook');
  const newWebhook = await registerWebhook(auth, env, webhook_url);
  if (!newWebhook) throw new Error(`webhook creation failed`);
  console.log('Successfully created webhook 🎉');
  console.log(newWebhook.url)
}

async function createSubscription(auth, env) {
  console.log('Subscribing to events');
  const subscription = await subscribe(auth, env);
  console.log('Subscribed!');
}

async function main(auth, env, webhook_url) {
  await cleanOldWebhook(auth, env);
  await registerNewWebhook(auth, env, webhook_url);
  await createSubscription(auth, env);
}

main(auth, env, webhook_url).then(_ => {
  console.log('All Done');
}).catch(e => console.error(e));
