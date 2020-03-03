const config = require('../local.json');

const { send, destroy } = require('../lib/twitter/dm');

const auth = {
  access_token,
  access_token_secret,
  consumer_key,
  consumer_secret
} = config;

async function main () {
  const { id } = await send(auth, config.moderator_id, 'Oh hi!');
  const success = await destroy(auth, id);
  return 'Succesffully sent + deleted a dm';
}

main()
  .then(result => console.log(result))
  .catch(error => console.error(error));
