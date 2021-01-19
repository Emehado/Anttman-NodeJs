const request = require("supertest");
const { expect } = require("chai");
const { User } = require("../../../models/Users");
const bcrypt = require("bcrypt");
let server;

describe("/api/auth/signin", () => {
  beforeEach(() => {
    server = require("../../../bin/www");
  });

  afterEach(async () => {
    await User.deleteMany({});
    server.close();
  });
  it("should return 400 if email failed validation", async () => {
    const res = await request(server)
      .post("/api/auth/signin")
      .send({ password: "1234" });

    expect(res.status).to.equal(400);
  });

  it("should return 400 if password failed validation", async () => {
    const res = await request(server)
      .post("/api/auth/signin")
      .send({ email: "emehado@gmail.com" });

    expect(res.status).to.equal(400);
  });

  it("should return 400 if email doesnt match any in the database", async () => {
    const res = await request(server).post("/api/auth/signin").send({
      email: "emehado@gmail.com",
      password: "123456",
    });

    expect(res.status).to.equal(400);
  });

  it("should return 400 if password is incorrect", async () => {
    const user = new User({
      firstname: "bright",
      lastname: "nanevie",
      email: "emehado@gmail.com",
      password: "123456",
    });
    await user.save();
    const res = await request(server).post("/api/auth/signin").send({
      email: "emehado@gmail.com",
      password: "1234567",
    });

    expect(res.status).to.equal(400);
  });

  it("should return 200 if credentials matched", async () => {
    const password = await bcrypt.hash("123456", 10);
    const user = new User({
      firstname: "bright",
      lastname: "nanevie",
      email: "emehado@gmail.com",
      password,
    });
    await user.save();
    const res = await request(server).post("/api/auth/signin").send({
      email: "emehado@gmail.com",
      password: "123456",
    });

    console.log(res.headers);

    expect(res.status).to.equal(200);
    expect(res.headers["x-auth-token"]).to.be.a("string");
  });
});
