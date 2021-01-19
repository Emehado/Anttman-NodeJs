const request = require("supertest");
const { expect } = require("chai");
const { Customer } = require("../../../models/Customer");
const { User } = require("../../../models/Users");
const mongoose = require("mongoose");

let server;
describe("/api/customer", () => {
  beforeEach(() => {
    server = require("../../../bin/www");
  });
  afterEach(async () => {
    server.close();
    await Customer.deleteMany({});
  });

  describe("GET", () => {
    it("should return a status of 401 if user not authenticated", async () => {
      const res = await request(server).get("/api/customer");
      expect(res.status).to.equal(401);
    });

    it("should return all customers", async () => {
      await Customer.collection.insertMany([
        {
          firstname: "bright",
          lastname: "Nanevie",
          phone: "0543158880",
          email: "emehado@gmail.com",
        },
        {
          firstname: "israel",
          lastname: "Nanevie",
          phone: "0208084342",
          email: "izzy@gmail.com",
        },
      ]);
      const token = new User().generateAuthToken();
      const res = await request(server)
        .get("/api/customer")
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.some((customer) => customer.firstname === "bright")).to.be
        .true;
      expect(res.body.some((customer) => customer.firstname === "israel")).to.be
        .true;
      expect(res.body.some((customer) => customer.lastname === "Nanevie")).to.be
        .true;
      expect(res.body.some((customer) => customer.phone === "0543158880")).to.be
        .true;
      expect(res.body.some((customer) => customer.phone === "0208084342")).to.be
        .true;
      expect(
        res.body.some((customer) => customer.email === "emehado@gmail.com")
      ).to.be.true;
      expect(res.body.some((customer) => customer.email === "izzy@gmail.com"))
        .to.be.true;
    });

    it("should return 404 if a customer is not found", async () => {
      const id = mongoose.Types.ObjectId();
      const token = new User().generateAuthToken();

      const res = await request(server)
        .get(`/api/customer/${id}`)
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(404);
    });

    it("should return a customer specified by id", async () => {
      const customer = new Customer({
        firstname: "bright",
        lastname: "Nanevie",
        phone: "0543158880",
        email: "emehado@gmail.com",
      });
      await customer.save();
      const token = new User().generateAuthToken();

      const res = await request(server)
        .get(`/api/customer/${customer.id}`)
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
    });
  });

  describe("POST", () => {
    it("should return 401 if user is not authenticated", async () => {
      const res = await request(server).post("/api/customer").send();

      expect(res.status).to.equal(401);
    });

    it("should return 400 if validation is not passed", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/customer")
        .set({ "x-auth-token": token })
        .send({
          firstname: "br",
          lastname: "Na",
          phone: "054",
          email: "emehado@gmail.c",
        });

      expect(res.status).to.equal(400);
    });

    it("should return the customer if created successfully", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/customer")
        .set({ "x-auth-token": token })
        .send({
          firstname: "bright",
          lastname: "Nanevie",
          phone: "0543158880",
          email: "emehado@gmail.com",
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
      expect(res.body.firstname === "bright").to.be.true;
      expect(res.body.lastname === "Nanevie").to.be.true;
      expect(res.body.phone === "0543158880").to.be.true;
      expect(res.body.email === "emehado@gmail.com").to.be.true;
    });
  });

  describe("PUT", () => {
    it("should return 401 if user is not authenticated", async () => {
      const res = await request(server).post("/api/customer").send();

      expect(res.status).to.equal(401);
    });

    it("should return 400 if request failed validation", async () => {
      const token = new User().generateAuthToken();
      const id = mongoose.Types.ObjectId();

      const res = await request(server)
        .put(`/api/customer/${id}`)
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(400);
    });

    it("should return 400 if customer id is not a valid mongodb object id", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/customer")
        .set({ "x-auth-token": token })
        .send();

      expect(res.status).to.equal(400);
    });

    it("should return null if customer id specified was not found", async () => {
      const customer = new Customer();
      const token = new User().generateAuthToken();

      const res = await request(server)
        .put(`/api/customer/${customer._id}`)
        .set({ "x-auth-token": token })
        .send({
          firstname: "bright",
          lastname: "Nanevie",
          phone: "0543158880",
          email: "emehado@gmail.com",
        });

      expect(res.status).to.equal(404);
    });

    it("should return the updated customer", async () => {
      const customer = new Customer({
        firstname: "bright",
        lastname: "Nanevie",
        phone: "0543158880",
        email: "emehado@gmail.com",
      });
      const token = new User().generateAuthToken();
      await customer.save();

      const res = await request(server)
        .put(`/api/customer/${customer.id}`)
        .set({ "x-auth-token": token })
        .send({
          firstname: "Daniel",
          lastname: "Kpeglo",
          phone: "0543158880",
          email: "dome@gmail.com",
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
      expect(res.body.firstname === "Daniel").to.be.true;
      expect(res.body.lastname === "Kpeglo").to.be.true;
      expect(res.body.phone === "0543158880").to.be.true;
      expect(res.body.email === "dome@gmail.com").to.be.true;
    });
  });

  describe("DELETE", () => {
    it("should return 401 if user is not authenticated", async () => {
      const res = await request(server).delete("/api/customer/id");

      expect(res.status).to.equal(401);
    });

    it("should return 400 if customer id is not a valid mongodb object id", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .delete("/api/customer/id")
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(400);
    });

    it("should return 403 if user does not have admin privileges", async () => {
      const token = new User().generateAuthToken();
      const customer = new Customer();
      const res = await request(server)
        .delete(`/api/customer/${customer._id}`)
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(403);
    });

    it("should return 404 if customer not found", async () => {
      const id = mongoose.Types.ObjectId();
      const token = new User({ isAdmin: true }).generateAuthToken();

      const res = await request(server)
        .delete(`/api/customer/${id}`)
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(404);
    });

    it("should return deleted customer if customer was deleted succesfully", async () => {
      const customer = new Customer({
        firstname: "bright",
        lastname: "nanevie",
        phone: "0246066037",
        email: "emehado@gmail.com",
      });
      await customer.save();
      const token = new User({ isAdmin: true }).generateAuthToken();

      const res = await request(server)
        .delete(`/api/customer/${customer._id}`)
        .set({ "x-auth-token": token });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
    });
  });
});
