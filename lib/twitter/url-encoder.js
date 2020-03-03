// Taken from https://github.com/LautaroJayat/twitter_bot
// MIT
function encode(str) {
  str = encodeURIComponent(str);
  str = str.replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
  return str;
}

module.exports = {
  encode
};
