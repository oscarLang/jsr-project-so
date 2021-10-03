const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const market = require("./market");

io.origins(['https://oscarlang.me:443', "http://localhost:3000"]);
io.on('connection', function (socket) {
    console.info("User connected");
    socket.on('quantityChange', async function (stock) {
        var obj = await market.getOneObject(stock);
        console.log(obj);
        io.emit('quantity change', obj);
    });
});

async function getRandomStock() {
    var objects = await market.getAllObjectsFromDb();
    var obj = objects[Math.floor(Math.random() * objects.length)];
    let oldPrice = obj.price;
    let newPrice = market.getNewPrice(obj);
    market.updateObjectInDb(obj.stock, newPrice);
    let change = ((newPrice - oldPrice) / oldPrice) * 100;

    let stockAndNewPrice = {
        name: obj.name,
        quantity: obj.quantity,
        price: newPrice,
        change: change.toFixed(2)
    };
    return stockAndNewPrice;
}

(function market() {
    var randomTimeOut = Math.round(Math.random() * (2000 - 1000)) + 1000;
    setTimeout(async function() {
        let changedStock = await getRandomStock();
        io.emit("marketChange", changedStock);
        market();
    }, randomTimeOut);
}());

// setInterval(async function () {
//     var objects = await market.getAllObjectsFromDb();
//     var obj = objects[Math.floor(Math.random() * objects.length)];
//     let oldPrice = obj.price;
//     let newPrice = market.getNewPrice(obj);
//     market.updateObjectInDb(obj.stock, newPrice);
//     let change = ((newPrice - oldPrice) / oldPrice) * 100;
//
//     let stockAndNewPrice = {
//         name: obj.name,
//         price: newPrice,
//         change: change.toFixed(2)
//     };
//     console.log(stockAndNewPrice);
//     io.emit("marketChange", stockAndNewPrice);
// }, 1000);

server.listen(8300);
