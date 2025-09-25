const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { expect } = require('chai');

describe('MongoDB Connection', function() {
  it('should connect to MongoDB successfully', async function() {
    // override MONGO_URI for test environment
    process.env.MONGO_URI = 'mongodb+srv://PGA:LkNu6fladxVH7p9U@cluster0.7ckdq3d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    let error = null;
    try {
      await connectDB();
    } catch (err) {
      error = err;
    }
    expect(error).to.be.null;
    expect(mongoose.connection.readyState).to.equal(1); // 1 = connected
  });
});
