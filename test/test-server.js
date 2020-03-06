'use strict';
const fetch = require('node-fetch');
const {
  beforeEach,
  afterEach,
  test
} = require('tap');
const { server } = require('../');

beforeEach((done) => {
  server.listen(8080, done);
});

afterEach((done) => {
  server.close(done);
});

test('request to /', async (t) => {
  const res = await fetch('http://localhost:8080/');
  t.ok(res.ok, 'the response should be good!');
  t.equals(res.status, 200, 'status should be 200');

  const txt = await res.text();
  t.equal(txt, 'Oh hi', 'should get expected response');
});

test('generic request to /webook', async (t) => {
  const res = await fetch('http://localhost:8080/webhook');
  t.notOk(res.ok, 'the response should not be good!');
  t.equals(res.status, 404, 'status should be 404');

  const txt = await res.text();
  t.equal(txt, '404\'d', 'should get expected response');
});

// test('crc_token request to /webook', async (t) => {
//   const res = await fetch('http://localhost:8080/webhook?crc_token=12345', {
//     method: 'POST'
//   });
//   t.ok(res.ok, 'the response should be good!');
//   t.equals(res.status, 200, 'status should be 404');
//
//   const { response_token } = await res.json();
//   t.equal(txt, '404\'d', 'should get expected response');
// });
