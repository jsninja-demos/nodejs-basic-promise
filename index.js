const fs = require('fs');
const https = require('https');
const util = require('util');

function readFilePromise(name, encode) {
  return util.promisify(fs.readFile)(name, encode);
}

function writePromise(name, data, encode) {
  return util.promisify(fs.writeFile)(name, data, encode);
}

function httpsGetPromise(url) {
  return new Promise((res, rej) => {
    https.get(url, response => {
      let data = '';

      response.setEncoding('utf8');
      response.on('error', err => rej(err));
      response.on('data', d => (data += d));
      response.on('end', () => res(data));
    });
  });
}

readFilePromise('./token.json', 'utf8')
  .then(JSON.parse)
  .then(creds =>
    setInterval(
      () =>
        httpsGetPromise(
          `${creds.url}liveChatId=${creds.chatId}&key=${creds.token}`,
        )
          .then(() => JSON.parse('sdfsdfd'))
          .then(({ items }) =>
            items.map(i => i.snippet.textMessageDetails.messageText + '\n'),
          )
          .then(history => writePromise('./chat.txt', history, 'utf8'))
          .then(console.log)
          .catch(err => console.log('err', err)),
      1000,
    ),
  );
