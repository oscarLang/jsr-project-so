const mongo = require("mongodb").MongoClient;
const dsn =  "mongodb://localhost:27017";
var getYear = require('date-fns/getYear');
var getMonth = require('date-fns/getMonth');
var getDay = require('date-fns/getDay');
var getMinutes = require('date-fns/getMinutes');
var getHours = require('date-fns/getHours');
var format = require('date-fns/format');
let dbName = 'project';

async function getAllObjectsFromDb() {
    const client = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    const res = await col.find().toArray();
    await client.close();
    return res;
}

async function getOneObject(ticker) {
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    const res = await col.findOne({ticker: ticker});
    return res;
}


async function updateHistoryOfAllObjects(timeFrame, date, slice, ticker,) {
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    const res = await col.find().toArray();
    await Promise.all(res.map( async (stock) => {
        await col.updateOne(
            {
                ticker: stock.ticker
            },
            {
                $push: {
                    [timeFrame]: {
                        $each: [{
                            date: date,
                            formatedDate: format(date, "yyyy/MM/dd-HH:mm"),
                            price: stock.price
                        }],
                        $slice: slice,
                        $sort: { "date": -1}
                    }
                }
            }
        );
    }));
    await client.close();
}


async function updatePrice(ticker, newPrice) {
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    await col.updateOne(
        {
            ticker: ticker
        },
        {
            $set: {
                price: newPrice
            }
        }
    );
    await client.close();
}

function getNewPrice(obj) {
    const random = Math.random();
    let changeInPercent = (2 * (obj.volatility * random));
    if (changeInPercent > obj.volatility) {
        changeInPercent -= (2 * obj.volatility);
    }
    let change = obj.price * changeInPercent;
    let newPrice = +obj.price + +change;
    return parseFloat(newPrice).toFixed(5);
}

module.exports = {
    getAllObjectsFromDb: getAllObjectsFromDb,
    getOneObject: getOneObject,
    updatePrice: updatePrice,
    getNewPrice: getNewPrice,
    updateHistoryOfAllObjects: updateHistoryOfAllObjects
};
