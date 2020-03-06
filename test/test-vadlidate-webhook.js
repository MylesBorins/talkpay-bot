const { test } = require('tap');

const validateWebhook = require('../routes/validate-webhook');

test('we get expected resuls', t => {
  const res = {
    writeHead: (code, options) => {
      t.equals(code, 200);
      t.deepEquals(options, {
        'content-type': 'application/json'
      });
    },
    write: val => {
      t.equals(
        val,
        '{"response_token":"sha256=rCq4c3Kw116JJ4rIxl0aR3lhY8UZ0ZsQsv6IBQY6YFE="}'
      );
    },
    end: t.end
  }
  validateWebhook({
    consumer_secret: '12345'
  }, 'I-am-a-token', res);
});

test('no auth', t => {
  const res = {
    writeHead: (code) => {
      t.equals(code, 500);
    },
    write: val => {
      t.equals(val, '500: Something went seriously wrong.');
    },
    end: t.end
  }
  validateWebhook({
    consumer_secret: undefined
  }, 'I-am-a-token', res);
});
