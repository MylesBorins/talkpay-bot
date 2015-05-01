#talkpay-bot

DM @talkpayBot and your message will be anonymously tweeted.

Fill in the data in local.json-dist and move it to local.json to get started

## OMG DOCKER

Clone this repo, and create a local.json.

**Build a container:**

```bash
docker build -t talkpay-bot .
```

**Run the container:**
```
docker run -d --name talkpay-bot -v $PWD/local.json:/local.json talkpay-bot
```
