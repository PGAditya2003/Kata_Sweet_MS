const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../server");
const User = require("../models/User");

describe("Auth Route - Login", () => {
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

    const hashedPassword = await bcrypt.hash("password123", 10);

    await User.create({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      role: "user",
    });
  });

  it("should return token and role on successful login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("role", "user");
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrongpass" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should fail login with non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexist@example.com", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });
});
