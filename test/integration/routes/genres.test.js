const request = require("supertest");
const { ServiceCategory } = require("../../../models/ServiceCategory");
const { User } = require("../../../models/Users");
const { expect } = require("chai");
const mongoose = require("mongoose");
let server;

describe("/api/genre", () => {
  beforeEach(() => {
    server = require("../../../bin/www");
  });
  afterEach(async () => {
    server.close();
    await ServiceCategory.deleteMany({});
  });

  describe("GET", () => {
    it("should return no genres found if genre list is empty", async () => {
      const res = await request(server).get("/api/genre");
      expect(res.status).to.equal(200);
      expect(res.body).to.be.empty;
    });

    it("should get all genres", async () => {
      await ServiceCategory.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
      const res = await request(server).get("/api/genre");
      expect(res.status).to.equal(200);
      expect(res.body.length).to.equal(2);
      expect(res.body.some((e) => e.name === "genre1")).to.be.true;
      expect(res.body.some((e) => e.name === "genre2")).to.be.true;
    });
  });

  describe("GET/:id", () => {
    it("should return the genre with the specified id", async () => {
      await ServiceCategory.collection.insertOne({ name: "Thriller" });

      const res = await request(server).get(`/api/genre`);

      const id = res.body[0]._id;

      const resp = await request(server).get(`/api/genre/${id}`);

      expect(resp.status).to.equal(200);
      expect(resp.body).to.be.an("object");
      expect(resp.body._id).to.equal(id);
      expect(resp.body.name).to.equal("Thriller");
    });

    it("should return 404 if specified genre id was not found", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/genre/${id}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.be.empty;
    });
  });

  describe("POST", () => {
    it("should return 401 if user is not authenticated", async () => {
      const res = await request(server)
        .post("/api/genre")
        .send({ name: "genre3" });

      expect(res.status).to.equal(401);
    });

    it("should return the 400 if genre name is less than 3 letters", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/genre")
        .set({ "x-auth-token": token })
        .send({ name: "ge" });

      expect(res.status).to.equal(400);
    });

    it("should return the 400 if genre name is more than 255 letters", async () => {
      const name = new Array(257).join("a");
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/genre")
        .set({ "x-auth-token": token })
        .send({ name });

      expect(res.status).to.equal(400);
    });

    it("should return save the genre if it is valid", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/genre")
        .set({ "x-auth-token": token })
        .send({ name: "genre3" });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
      expect(res.body.name).to.equal("genre3");
    });
  });
});
