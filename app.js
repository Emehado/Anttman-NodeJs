const express = require("express");

const app = express();
require("./startup/logging")();
require("./startup/db")();
require("./startup/config")();
require("./startup/routes")(app);

module.exports = app;
