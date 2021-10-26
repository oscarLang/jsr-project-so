const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const market = require("./market");
var startOfMinute = require('date-fns/startOfMinute');
var startOfHour = require('date-fns/startOfHour');
var format = require('date-fns/format');


io.origins(['https://oscarlang.me:443', "http://localhost:3000"]);
io.on('connection', function (socket) {
    console.info("User connected");
    socket.on('quantityChange', async function (ticker) {
        var obj = await market.getOneObject(ticker);
        io.emit('quantity change', obj);
    });
});

async function getRandomStock() {
    var objects = await market.getAllObjectsFromDb();
    var obj = objects[Math.floor(Math.random() * objects.length)];
    let oldPrice = obj.price;
    let newPrice = market.getNewPrice(obj);
    market.updatePrice(obj.ticker, newPrice);
    let change = ((newPrice - oldPrice) / oldPrice) * 100;

    let stockAndNewPrice = {
        ticker: obj.ticker,
        price: newPrice,
        change: change.toFixed(2)
    };
    return stockAndNewPrice;
}

(function run() {
    const secondly = setInterval(async function() {
        try {
            let changedStock = await getRandomStock();
            console.log(changedStock);
            io.emit("marketChange", changedStock);
        } catch (error) {
            console.log(error);
        }
    }, 1000);
    const minutly = setInterval(async function() {
        const date = startOfMinute(new Date());
        await market.updateHistoryOfAllObjects("minutly", date, 1440);
    }, 60000);
}());
server.listen(8300);
