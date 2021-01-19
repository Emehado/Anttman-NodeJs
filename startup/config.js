const config = require("config");
module.exports = function () {
  if (!config.has("jwt_secret")) {
    throw new Error("jwt secret not found");
  }
};
