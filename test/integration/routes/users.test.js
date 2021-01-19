const request = require("supertest");
const { expect } = require("chai");
const { User } = require("../../../models/Users");
const mongoose = require("mongoose");

let server;
describe("/api/customer", () => {
  beforeEach(() => {
    server = require("../../../bin/www");
  });
  afterEach(async () => {
    server.close();
    await User.deleteMany({});
  });

  describe("GET", () => {
    it("should return a status of 401 if user not authenticated", async () => {
      const res = await request(server).get("/api/user");
      expect(res.status).to.equal(401);
    });

    it("should return a status of 403 if user not authorized", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .get("/api/user")
        .set({ "x-auth-token": token });
      expect(res.status).to.equal(403);
    });

    it("should return all users", async () => {
      await User.collection.insertMany([
        {
          firstname: "bright",
          lastname: "Nanevie",
          email: "emehado@gmail.com",
          password: "123456",
          isAdmin: true,
        },
        {
          firstname: "israel",
          lastname: "Nanevie",
          email: "emedo@gmail.com",
          password: "123456",
          isAdmin: true,
        },
      ]);
      const token = new User({ isAdmin: true }).generateAuthToken();
      const res = await request(server)
        .get("/api/user")
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.some((user) => user.firstname === "bright")).to.be.true;
      expect(res.body.some((user) => user.firstname === "israel")).to.be.true;
      expect(res.body.some((user) => user.lastname === "Nanevie")).to.be.true;
      expect(res.body.some((user) => user.email === "emehado@gmail.com")).to.be
        .true;
      expect(res.body.some((user) => user.email === "emedo@gmail.com")).to.be
        .true;
    });
  });

  describe("POST", () => {
    it("should return a status of 401 if user not authenticated", async () => {
      const res = await request(server).post("/api/user");
      expect(res.status).to.equal(401);
    });

    it("should return a status of 403 if user not authorized", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/user")
        .set({ "x-auth-token": token });
      expect(res.status).to.equal(403);
    });

    it("should return 400 if validation is not passed", async () => {
      const token = new User({ isAdmin: true }).generateAuthToken();
      const res = await request(server)
        .post("/api/user")
        .set({ "x-auth-token": token })
        .send({
          firstname: "br",
          lastname: "Na",
          phone: "054",
          email: "emehado@gmail.c",
        });

      expect(res.status).to.equal(400);
    });

    it("should return 400 if email  provided already exist", async () => {
      const user = new User({
        firstname: "bright",
        lastname: "nanevie",
        email: "emehado@gmail.com",
        password: "larson",
        isAdmin: true,
      });
      const token = user.generateAuthToken();
      user.save();

      const res = await request(server)
        .post("/api/user")
        .set({ "x-auth-token": token })
        .send({
          firstname: "bright",
          lastname: "nanevie",
          email: "emehado@gmail.com",
          password: "larson",
        });

      expect(res.status).to.equal(400);
    });

    it("should return the user if created successfully", async () => {
      const token = new User({ isAdmin: true }).generateAuthToken();
      const res = await request(server)
        .post("/api/user")
        .set({ "x-auth-token": token })
        .send({
          firstname: "bright",
          lastname: "Nanevie",
          password: "0543158880",
          email: "emehado@gmail.com",
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
      expect(res.body.firstname === "bright").to.be.true;
      expect(res.body.lastname === "Nanevie").to.be.true;
      expect(res.body.email === "emehado@gmail.com").to.be.true;
      expect(res.body.isAdmin).to.be.false;
    });
  });

  describe("PUT", () => {
    it("should return a status of 401 if user not authenticated", async () => {
      const res = await request(server).post("/api/user");
      expect(res.status).to.equal(401);
    });

    it("should return a status of 403 if user not authorized", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/user")
        .set({ "x-auth-token": token });
      expect(res.status).to.equal(403);
    });

    it("should return 400 if user id is not a valid mongodb object id", async () => {
      const token = new User({ isAdmin: true }).generateAuthToken();
      const res = await request(server)
        .post("/api/user")
        .set({ "x-auth-token": token })
        .send();

      expect(res.status).to.equal(400);
    });

    it("should return 400 if request failed validation", async () => {
      const token = new User({ isAdmin: true }).generateAuthToken();
      const id = mongoose.Types.ObjectId();

      const res = await request(server)
        .put(`/api/user/${id}`)
        .set({ "x-auth-token": token })
        .send({ firstname: "br", lastname: "na" });

      expect(res.status).to.equal(400);
    });

    it("should return null if user id specified was not found", async () => {
      const user = new User();
      const token = new User({ isAdmin: true }).generateAuthToken();

      const res = await request(server)
        .put(`/api/user/${user._id}`)
        .set({ "x-auth-token": token })
        .send({
          firstname: "bright",
          lastname: "Nanevie",
          password: "0543158880",
          email: "emehado@gmail.com",
        });

      expect(res.status).to.equal(404);
    });

    it("should return the updated user", async () => {
      const user = new User({
        firstname: "bright",
        lastname: "Nanevie",
        password: "0543158880",
        email: "emehado@gmail.com",
      });
      const token = new User({ isAdmin: true }).generateAuthToken();
      await user.save();

      const res = await request(server)
        .put(`/api/user/${user.id}`)
        .set({ "x-auth-token": token })
        .send({
          firstname: "Daniel",
          lastname: "Kpeglo",
          password: "0543158880",
          email: "dome@gmail.com",
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
      expect(res.body.firstname === "Daniel").to.be.true;
      expect(res.body.lastname === "Kpeglo").to.be.true;
      expect(res.body.email === "dome@gmail.com").to.be.true;
    });
  });

  describe("DELETE", () => {
    it("should return a status of 401 if user not authenticated", async () => {
      const res = await request(server).post("/api/user");
      expect(res.status).to.equal(401);
    });

    it("should return a status of 403 if user not authorized", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/user")
        .set({ "x-auth-token": token });
      expect(res.status).to.equal(403);
    });

    it("should return 400 if user id is not a valid mongodb object id", async () => {
      const token = new User({ isAdmin: true }).generateAuthToken();
      const res = await request(server)
        .delete("/api/user/id")
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(400);
    });

    it("should return 404 if user not found", async () => {
      const id = mongoose.Types.ObjectId();
      const token = new User({ isAdmin: true }).generateAuthToken();

      const res = await request(server)
        .delete(`/api/user/${id}`)
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(404);
    });

    it("should return deleted user if user was deleted succesfully", async () => {
      const user = new User({
        firstname: "bright",
        lastname: "nanevie",
        password: "0246066037",
        email: "emehado@gmail.com",
      });
      await user.save();
      const token = new User({ isAdmin: true }).generateAuthToken();

      const res = await request(server)
        .delete(`/api/user/${user._id}`)
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
    });
  });
});
