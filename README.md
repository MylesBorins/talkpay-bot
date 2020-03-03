# talkpay-bot

DM @talkpayBot and your message will be anonymously tweeted.

## Getting started

### getting credentials

[Apply for an access](https://developer.twitter.com/en/apply-for-access) on https://developer.twitter.com.

To get Consumer + Access token you will need to [create an app](https://developer.twitter.com/en/apps/create)

To subscribe to the stream you will need to [create a dev environment](https://developer.twitter.com/en/account/environments).

More details can be found [in the developer.twitter.com docs](https://developer.twitter.com/en/docs/basics/getting-started).

### local testing

Only the examples found in `./examples` can be run on a local system.

They all expect to find config data in a `./local.json` file.
Please refer to `local.json-dist` for required fields.

### deploying to cloud

The following environment variable must be set when running in the cloud
```
CONSUMER_KEY="consumer key from twitter api"
CONSUMER_SECRET="consumer secret from twitter api"
ACCESS_TOKEN="access token from twitter api"
ACCESS_TOKEN_SECRET="access token secret from twitter api"
MODERATOR_ID="twitter ID of account that can mdoerate"
BOT_ID="twitter ID of the bot itself"
```

The provided Dockerfile is compatible with [Google Cloud Run](https://cloud.google.com/run)

```bash
gcloud builds submit --tag gcr.io/$PROJECT\_NAME/talkpay-bot
gcloud run deploy talkpay-bot --image gcr.io/$PROJECT\_NAME/talkpay-bot --platform managed

```

### registering webhook


```bash
node ./experiments/subscribe.js
```

## OMG cloud run




