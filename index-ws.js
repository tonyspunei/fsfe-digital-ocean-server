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

process.on("SIGINT", function() {
  wss.clients.forEach(function each(client) {
    client.close();
  });
  server.close(function() {
    shutdownDB();
  });
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

  db.run(
    `INSERT INTO visitors (count, time) VALUES (?, datetime('now'))`,
    [numClients],
    function(err) {
      if (err) {
        console.error('Error inserting visitor count:', err);
      }
    }
  );
  
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

/* End Websocket */

/* Begin Database SQLite */
const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

db.serialize(function() {
  db.run("CREATE TABLE visitors (count INTEGER, time TEXT)");
});

function getCounts() {
  db.each("SELECT * FROM visitors", function(err, row) {
    if (err) {
      console.error("Error fetching counts:", err);
    } else {
      console.log(row);
    }
  });
}

function shutdownDB() {
  getCounts();
  console.log("Database shutting down...");
  db.close();
}