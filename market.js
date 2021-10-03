const mongo = require("mongodb").MongoClient;
const dsn =  "mongodb://localhost:27017";
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
    let now = new Date();
    const client  = await mongo.connect(dsn);
    const db = await client.db(dbName);
    const col = await db.collection('objects');
    await col.updateOne(
        {
            stock: stock
        },
        {
            $set: {
                price: newPrice
            },
            $push: {
                history: {
                    $each: [{
                        price: newPrice
                    }],
                    $slice: -50
                }
            },
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
