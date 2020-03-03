const fetch = require('node-fetch');
const Headers = fetch.Headers;

const {
  access_token,
  access_token_secret,
  consumer_key,
  consumer_secret,
  env,
  webhook_url
} = require('../local.json');

const { getBearerToken } = require('../lib/auth/bearer');

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

async function cleanOldWebhook() {
  const bearer = await getBearerToken({
    user: consumer_key,
    pass: consumer_secret
  });
  console.log('Getting existing webhook');
  const webhooks = await getWebhooks(bearer, env);
  if (!webhooks instanceof Array) throw webhooks;
  const webhook = webhooks[0];
  if (webhook) {
    console.log(`webhook found`);
    console.log(webhook.url)
    console.log('Deleting webhook');
    const success = await deleteWebhook(bearer, env, webhook.id);
    if (!success) throw new Error('webhook deletion failed');
    console.log('Successfully deleted webhook');
  }
  else {
    console.log('No webhook found');
  }
}

async function registerNewWebhook() {
  console.log('Registering new webhook');
  const newWebhook = await registerWebhook(auth, env, webhook_url);
  if (!newWebhook) throw new Error(`webhook creation failed`);
  console.log('Successfully created webhook 🎉');
  console.log(newWebhook.url)
}

async function createSubscription() {
  console.log('Subscribing to events');
  const subscription = await subscribe(auth, env);
  console.log('Subscribed!');
}

async function main(auth) {
  await cleanOldWebhook();
  await registerNewWebhook();
  await createSubscription();
}

main().then(_ => {
  console.log('All Done');
}).catch(e => console.error(e));
