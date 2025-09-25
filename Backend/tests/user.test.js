const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { expect } = require("chai");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

describe("User Model", function () {
  let mongoServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("should create a user successfully with required fields", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      role: "user"
    });

    expect(user).to.have.property("_id");
    expect(user.username).to.equal("testuser");
    expect(user.email).to.equal("test@example.com");
    expect(user.role).to.equal("user");
  });

  it("should throw validation error if required fields are missing", async () => {
    let error = null;
    try {
      await User.create({ email: "missingusername@example.com" });
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors).to.have.property("username");
    expect(error.errors).to.have.property("password");
  });

  it("should enforce enum role values", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    let error = null;
    try {
      await User.create({
        username: "badroleuser",
        email: "badrole@example.com",
        password: hashedPassword,
        role: "invalidrole"
      });
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors.role.message).to.include("is not a valid enum value");
  });
});
