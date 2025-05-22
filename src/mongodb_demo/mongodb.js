import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017/your_db_name';
const client = new MongoClient(uri);
let db = null;

export async function connectMongoDB() {
  if (!db) {
    await client.connect();
    db = client.db(); // hoặc client.db('your_db_name')
    console.log('Đã kết nối MongoDB!');
  }
  return db;
}

export { db }; 