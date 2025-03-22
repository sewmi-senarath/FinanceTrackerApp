// const { MongoMemoryServer } = require('mongodb-memory-server');
// const mongoose = require('mongoose');
// require('dotenv').config();
// const {app,server} = require('../app');

// let mongoServer;

// beforeAll(async () => {
//   jest.setTimeout(30000); // 30 seconds
//   mongoServer = await MongoMemoryServer.create(); 
//   const uri = mongoServer.getUri(); 
//   await mongoose.connect(uri); 
// });

// afterAll(async () => {
//   await mongoose.disconnect(); // Disconnect Mongoose
//   await mongoServer.stop(); // Stop the in-memory MongoDB server
//   await server.close(); // Close the server after all tests
// });

// beforeEach(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     await collections[key].deleteMany({}); // Clear all collections
//   }
// });

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
require('dotenv').config();
const { app, server } = require('../app');

let mongoServer;

beforeAll(async () => {
  jest.setTimeout(20000); // 20 seconds timeout for setup
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Close any existing mongoose connections before starting a new one
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // await mongoose.connect(uri, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // });

  await mongoose.connect(uri);
});

afterEach(async () => {
  // Ensure each test starts with a clean database
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close(); // Ensure all connections are closed
  await mongoServer.stop(); // Stop the in-memory MongoDB server
  await server.close(); // Close the Express server
});
