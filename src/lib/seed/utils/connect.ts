import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://mongo1:27017/dev';
if (!uri) throw new Error('MONGODB_URI is not set!');

let client: MongoClient;

export async function connectDB() {
    if (!client) {
        client = new MongoClient(uri);
    }
    const db = (await client.connect()).db();
    return { client, db };
}

export async function closeDB() {
    if (client) {
        await client.close();
    }
}
