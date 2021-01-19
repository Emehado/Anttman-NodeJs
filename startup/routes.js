const express = require("express");
// const path = require("path");
// const cookieParser = require("cookie-parser");
const log = require("morgan");
const helmet = require("helmet");

const indexRouter = require("../routes/index");
const userRouter = require("../routes/users");
const customersRouter = require("../routes/customer");
const movieRouter = require("../routes/movies");
const rentalRouter = require("../routes/rentals");
const genreRouter = require("../routes/genres");
const authRouter = require("../routes/auth");
const serviceCategory = require("../routes/serviceCategory");

const serviceProvider = require("../routes/serviceProvider");
const job = require("../routes/job");
const error = require("../middlewares/error");

module.exports = function (app) {
  process.env.NODE_ENV === "production" && app.use(helmet());

  app.use(log("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  // app.use(cookieParser());
  // app.use(express.static(path.join(__dirname, "public")));

  app.use("/", indexRouter);
  app.use("/api/customer", customersRouter);
  app.use("/api/movie", movieRouter);
  app.use("/api/rental", rentalRouter);
  app.use("/api/genre", genreRouter);
  app.use("/api/user", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/serviceCategory", serviceCategory);
  app.use("/api/job", job);

  app.use("/api/serviceProvider", serviceProvider);

  app.use(error);
};
