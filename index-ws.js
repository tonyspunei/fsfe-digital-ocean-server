const express = require("express");
const server = require("http").createServer();
const app = express();

app.get("/", (req, res) => {
	res.sendFile("index.html", {root: __dirname});
});

server.on("request", app);

server.listen(3000, () => {
	console.log("Server is running on port 3000");
});

/* Begin Websocket */
const WebSocket = require("ws").Server;
const wss = new WebSocket({server: server});

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
	console.log("Clients connected: ", numClients);

  wss.broadcast("Current visitors: " + numClients);

  if(ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server!");
  }
  
  ws.on("close", function close() {
    wss.broadcast("Current visitors: " + numClients);
    console.log("A Client has disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if(client.readyState === client.OPEN) {
      client.send(data);
    }
  });
};