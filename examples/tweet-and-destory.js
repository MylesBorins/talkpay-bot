const { update, destroy } = require('../lib/twitter/tweet');

const config = require('../local.json');

const auth = {
  access_token,
  access_token_secret,
  consumer_key,
  consumer_secret
} = config;

const msg = `Your lucky number is ${Math.floor(Math.random() * 1000)}`;

async function main () {
  const id = await update(auth, msg);
  const success = await destroy(auth, id);
  return 'We successfully created and deleted a toot';
}

main()
  .then(result => console.log(result))
  .catch(error => console.error(error));
