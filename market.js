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

async function getOneObject(stock) {
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    const res = await col.findOne({stock: stock});
    return res;
}

async function updateObjectInDb(stock, newPrice) {
    const date = new Date();
    const formatedDate = format(date, "yyyy/MM/dd");
    const year = getYear(date);
    const month = getMonth(date);
    const day = getDay(date);
    const hour = getHours(date);
    const minute = getMinutes(date);
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    await col.updateOne(
        {
            $and: [
                {stock: stock},
                {"history.minute": {$ne: minute}}
            ]
        },
        {
            $set: {
                price: newPrice
            },
            $push: {
                history: {
                    price: newPrice,
                    date: formatedDate,
                    year: year,
                    month: month,
                    day: day,
                    hour: hour,
                    minute: minute
                }
            }
        }
    );
    await client.close();
}

function getNewPrice(obj) {
    let trend = (Math.random() > 0.5) ? 1 : -1;
    if (obj.price < 1) {
        trend = 1;
    }
    let newPrice = (obj.price * obj.rate) + (obj.variance * trend);
    return newPrice.toFixed(2);
}

module.exports = {
    getAllObjectsFromDb: getAllObjectsFromDb,
    getOneObject: getOneObject,
    updateObjectInDb: updateObjectInDb,
    getNewPrice: getNewPrice
};
