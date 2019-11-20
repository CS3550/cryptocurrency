var express = require('express');
var path = require('path');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var _  = require("lodash");

var port = 3000;


app.use(express.static(path.join(__dirname, 'static')));


let listClients = [];

let blockChain = [];

let initialBlock = {};
initialBlock.transactions = [];
initialBlock.meta={
  miner:"",
  minerReward:"0"
};
initialBlock.transactions.push({
  from:"",
  to:"abcdefg",
  transactionAmount:"1000",
  returnAmount:"0",
  leftover:"0"
});
blockChain.push(initialBlock);

let pendingTransactions = [];



listClients.push("abcdefg");

clientValues = {};

updateClientValues();

let myLocalAmount = 1000;


io.on('connection', function(socket){
  console.log('a user connected');
  
  socket.on('join', function(msg){
    
    console.log("join request");
    socket.emit('sendID', socket.client.id);
    listClients.push(socket.client.id);


   pendingTransactions.push({
      from:"abcdefg",
      to:socket.client.id,
      transactionAmount:"5",
      tominer:2
    });

    updateClientValues();


    io.sockets.emit('listClients', listClients);
    io.sockets.emit('clientValues', clientValues);
    io.sockets.emit('blockChain', blockChain);
    io.sockets.emit('pendingTransactions', pendingTransactions);

    
  });
  
  socket.on('disconnect', function(){
    console.log("disconnected");
    listClients = listClients.filter(i=>i != socket.client.id);
    io.sockets.emit('clientValues', clientValues);
    io.sockets.emit('listClients',listClients);
  })
});

function updateClientValues(){

  for(let i = 0; i < blockChain.length; i++){
    let block = blockChain[i];
    let transactions = block.transactions;
    let meta = block.meta;
    let minerGains = 0;
    for(let j = 0; j < transactions.length; j++){
      let transaction = transactions[j];
      let from = transaction.from;
      let to = transaction.to;
      let amount = transaction.transactionAmount;
      let tominer = transaction.tominer;
      
      if(from){
        if(!clientValues[from]){
          clientValues[from] = 0;
        }
        clientValues[from] -= +amount + +tominer;
      }
      if(!clientValues[to])
      {
        clientValues[to] = 0;
      }
      clientValues[to] += +amount;
      minerGains += +tominer;
    }
    if(meta.miner){
      if(!clientValues[meta.miner]){
        clientValues[meta.miner] = 0;
      }
      meta.miner += +minerGains;
    }
  }

}


// Listen for requests
var server = http.listen(port, function() {
  console.log('Loaded on port: ' + port);
});