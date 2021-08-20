import seedDatabase from '../seeds';
import mongoose from 'mongoose';

/**
 * Remove all collections
 */
async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
  }
}

/**
 * Drop all collections
 */
async function dropAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.drop();
    } catch (error) {
      // Sometimes this error happens, but you can safely ignore it
      if (error.message === 'ns not found') return;
      // This error occurs when you use it. You can
      // safely ignore this error too
      if (error.message.includes(
          'a background operation is currently running')) return;
      console.log(error.message);
    }
  }
}

/**
 * Setup database process for test
 * @param {string} databaseName
 * @param {string[]} seedModels
 */
export default function setupDB(
    databaseName: string,
    seedModels: string[] = []) {
  /**
   * Connect to Mongoose
   */
  beforeAll(async () => {
    const url = `mongodb://127.0.0.1/${databaseName}`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  });

  /**
   * Seed Data
   */
  beforeEach(async () => {
    await seedDatabase(seedModels);
  });

  /**
   * Cleans up database between each test
   */
  afterEach(async () => {
    await removeAllCollections();
  });

  /**
   * Disconnect Mongoose
   */
  afterAll(async () => {
    await dropAllCollections();
    await mongoose.connection.close();
  });
}
