const jwt = require("jsonwebtoken");
const config = require("config");
const debug = require("debug")("vidre:server");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied, missing auth token");

  try {
    const decoded = jwt.verify(token, config.get("jwt_secret"));
    req.user = decoded;
    next();
  } catch (e) {
    debug(e);
    res.status(400).send("Inavlid token");
  }
};
