import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI;
let client;
let db;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('ICE'); // Use the correct database name
  }
  return db;
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('EVENTS');

    const eventData = await collection.findOne({
      _id: new ObjectId('67ba4b28876839722173788b'),
    });

    if (!eventData || !eventData.ice_arrests) {
      return NextResponse.json({ message: 'No data found' }, { status: 404 });
    }

    const now = new Date();
    const past24hrs = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalEvents = eventData.ice_arrests.length;
    const past24hrsEvents = eventData.ice_arrests.filter(event => new Date(event.timestamp) >= past24hrs).length;
    const pastWeekEvents = eventData.ice_arrests.filter(event => new Date(event.timestamp) >= pastWeek).length;

    return NextResponse.json({ totalEvents, past24hrsEvents, pastWeekEvents });
  } catch (error) {
    console.error('Error fetching ICE events:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
