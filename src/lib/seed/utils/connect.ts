import { logSuccess } from '@/lib/seed/utils/logger';
import { MongoClient } from 'mongodb';

const uri = "mongodb://megz:megz@ac-ojzympx-shard-00-00.qilsmnc.mongodb.net:27017,ac-ojzympx-shard-00-01.qilsmnc.mongodb.net:27017,ac-ojzympx-shard-00-02.qilsmnc.mongodb.net:27017/prod-demo?ssl=true&replicaSet=atlas-ud3hsu-shard-0&authSource=admin&retryWrites=true&w=majority";
if (!uri) throw new Error('MONGODB_URI is not set!');

let client: MongoClient;

export async function connectDB() {
    if (!client) {
        client = new MongoClient(uri);
    }
    const db = (await client.connect()).db();
    logSuccess(`Connected to DB: ${uri}`)
    return { client, db };
}

export async function closeDB() {
    if (client) {
        await client.close();
    }
}
