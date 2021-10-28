const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
});
  
const market = require("./market");
const { startOfDay, format, startOfHour, startOfMinute } = require('date-fns');

io.on('connection', function (socket) {
    console.log("con");
});

async function getRandomStock() {
    var objects = await market.getAllObjectsFromDb();
    var obj = objects[Math.floor(Math.random() * objects.length)];
    let oldPrice = obj.price;
    let newPrice = market.getNewPrice(obj);
    let change = ((newPrice - oldPrice) / oldPrice) * 100;
    if (Number(change) !== 0) {
        market.updatePrice(obj.ticker, newPrice);

    }
    let stockAndNewPrice = {
        ticker: obj.ticker,
        price: newPrice,
        change: change.toFixed(2),
        changePositive: (change >= 0),
        date: new Date()
    };
    return stockAndNewPrice;
}

(function run() {
    const secondly = setInterval(async function() {
        try {
            let changedStock = await getRandomStock();
            if (Number(changedStock.change) !== 0) {
                io.emit(`marketChange${changedStock.ticker}`, changedStock);
            }
        } catch (error) {
            console.log(error);
        }
    }, 1000);
    const minutly = setInterval(async function() {
        try {
            const date = startOfMinute(new Date());
            await market.updateHistoryOfAllObjects("minutly", date, 60);
            const stocks = await market.getAllObjectsFromDb();
            io.emit("minutly", stocks);
            console.log("Minutes history updated");
        } catch (error) {
            console.log("Error while updating minute history", error);
        }
    }, 60000);

    const hourly = setInterval(async function() {
        try {
            const date = startOfHour(new Date());
            await market.updateHistoryOfAllObjects("hourly", date, 168);
            console.log("Hours history updated");
        } catch (error) {
            console.log("Error while updating hour history", error);
        }
    }, 3600000);

    const daily = setInterval(async function() {
        try {
            const date = startOfDay(new Date());
            await market.updateHistoryOfAllObjects("daily", date, 30);
            console.log("Days history updated");
        } catch (error) {
            console.log("Error while updating daily history", error);
        }
    }, 86400000);
}());
server.listen(8300);
