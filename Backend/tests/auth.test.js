const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const { expect } = require("chai");
const bcrypt = require("bcryptjs");
const app = require("../server");
const User = require("../models/User");

describe("Auth Route - Login", function () {
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

    const hashedPassword = await bcrypt.hash("password123", 10);

    await User.create({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword, // matches schema
      role: "user",
    });
  });

  it("should return token and role on successful login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
    expect(res.body).to.have.property("role", "user");
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrongpass" });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Invalid credentials");
  });

  it("should fail login with non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexist@example.com", password: "password123" });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Invalid credentials");
  });
});
