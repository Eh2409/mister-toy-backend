import { MongoClient } from 'mongodb'
import { config } from '../config/index.js'

export const dbService = {
    getCollection,
}


var dbConn = null

async function getCollection(collectionName) {
    const db = await _connect()
    return db.collection(collectionName)
}

async function _connect() {
    if (dbConn) return dbConn
    try {
        const client = await MongoClient.connect(config.dbURL)
        const db = client.db(config.dbName)
        dbConn = db
        return db
    } catch (err) {
        console.log('Cannot Connect to DB', err)
        throw err
    }
}

