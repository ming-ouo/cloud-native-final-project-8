const { MongoClient } = require('mongodb');

const logger = require('./logger')('MongoCache');

class MongoCache {
    constructor(uri, dbName, collectionName) {
        this.client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
        this.dbName = dbName;
        this.collectionName = collectionName;
    }

    async connect() {
        await this.client.connect(function(err, db) {
            if (err) {
                logger.error("Unable to connect to MongoDB server", err);
                throw err
            } else {
                logger.info("Successfully connect to MongoDB server")
            }
        });

        await this.client.db(this.dbName).collection(this.collectionName).createIndex( { key: 1 }, { unique: true } )
    }

    async set(key, value) {
        const query = { key: key };
        const update = { $set: { key: key, value: value }};
        const options = { upsert: true };

        this.client.db(this.dbName).collection(this.collectionName).updateOne(query, update, options);
    }

    async get(key) {
        const result = await this.client.db(this.dbName).collection(this.collectionName).findOne( { key: key } );

        if (!result) {
            return undefined;
        }

        if ('value' in result) {
            return result.value;
        }

        return undefined;
    }

    async close() {
        await this.client.close();
    }
}

module.exports = MongoCache;
