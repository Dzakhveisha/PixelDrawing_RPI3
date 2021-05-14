const WebSocket = require('ws');

let idCounter = 0;
const wsServer = new WebSocket.Server({port: 6968});
wsServer.on('connection', onConnect);

function onConnect(wsClient) { // connection with clienе
  console.log('Новый пользователь');
  idCounter++;
  wsClient.send(JSON.stringify({type: 'newId', id: idCounter}));

  wsClient.on('message', function(message) {
    wsServer.clients.forEach(function each(client) {
      if (client !== wsServer && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  wsClient.on('close', function() {
    console.log('Пользователь отключился');
  });
}

console.log('Сервер запущен на 6968 порту');


