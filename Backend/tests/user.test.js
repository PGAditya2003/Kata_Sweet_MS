const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

describe("User Model", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
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
      role: "user",
    });

    expect(user).toHaveProperty("_id");
    expect(user.username).toBe("testuser");
    expect(user.email).toBe("test@example.com");
    expect(user.role).toBe("user");
  });

  it("should throw validation error if required fields are missing", async () => {
    let error = null;
    try {
      await User.create({ email: "missingusername@example.com" });
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(error.errors).toHaveProperty("username");
    expect(error.errors).toHaveProperty("password");
  });

  it("should enforce enum role values", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    let error = null;
    try {
      await User.create({
        username: "badroleuser",
        email: "badrole@example.com",
        password: hashedPassword,
        role: "invalidrole",
      });
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(error.errors.role.message).toMatch(/is not a valid enum value/);
  });
});
