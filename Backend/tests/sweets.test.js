const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");

const app = require("../server"); // your Express app
const Sweet = require("../models/Sweet");
const User = require("../models/User");

describe("Sweet API", () => {
  let mongoServer;
  let adminToken;
  let userToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create admin and normal users
    const admin = await User.create({
      username: "adminuser",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });

    const user = await User.create({
      username: "normaluser",
      email: "user@example.com",
      password: "password123",
      role: "user",
    });

    // Sign JWTs
    adminToken = jwt.sign({ id: admin._id, role: "admin" }, "testsecret", { expiresIn: "1h" });
    userToken = jwt.sign({ id: user._id, role: "user" }, "testsecret", { expiresIn: "1h" });
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Sweet.deleteMany({});
  });

  // =============================
  // POST /api/sweets
  // =============================
  describe("POST /api/sweets", () => {
    it("should create a new sweet (admin only)", async () => {
      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Gulab Jamun", price: 20, stock: 50, imageUrl: "url1" });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Gulab Jamun");
      expect(res.body.price).toBe(20);
      expect(res.body.stock).toBe(50);
      expect(res.body.imageUrl).toBe("url1");
    });

    it("should fail if user is not admin", async () => {
      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Rasgulla", price: 25 });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Admin access required");
    });

    it("should fail if no token provided", async () => {
      const res = await request(app)
        .post("/api/sweets")
        .send({ name: "Ladoo", price: 15 });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("No token provided");
    });

    it("should not allow duplicate sweet names", async () => {
      await Sweet.create({ name: "Kaju Katli", price: 100 });
      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Kaju Katli", price: 120 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Sweet already exists");
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Besan Ladoo" }); // price missing

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Name and price are required");
    });
  });

  // =============================
  // GET /api/sweets
  // =============================
  describe("GET /api/sweets", () => {
    it("should get all sweets (public)", async () => {
      await Sweet.create({ name: "Barfi", price: 30, stock: 5 });

      const res = await request(app).get("/api/sweets");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("Barfi");
    });

    it("should return empty array if no sweets exist", async () => {
      const res = await request(app).get("/api/sweets");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // =============================
  // DELETE /api/sweets/:id
  // =============================
  describe("DELETE /api/sweets/:id", () => {
    it("should delete a sweet by id (admin only)", async () => {
      const sweet = await Sweet.create({ name: "Jalebi", price: 10, stock: 20 });

      const res = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Sweet deleted successfully");

      const inDb = await Sweet.findById(sweet._id);
      expect(inDb).toBeNull();
    });

    it("should fail if user is not admin", async () => {
      const sweet = await Sweet.create({ name: "Halwa", price: 40 });

      const res = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Admin access required");
    });

    it("should return 404 if sweet not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/sweets/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Sweet not found");
    });

    it("should return 400 for invalid ObjectId", async () => {
      const res = await request(app)
        .delete("/api/sweets/1234")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid Sweet ID");
    });
  });
});
