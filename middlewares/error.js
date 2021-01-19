const winston = require("winston");
require("winston-mongodb");
const config = require("config");

const transports = [
  new winston.transports.File({ filename: "routes.log" }),
  new winston.transports.MongoDB({
    db: config.get("DB_URI"),
    options: { useUnifiedTopology: true },
  })
]
if (process.env.NODE_ENV === 'development') {
  transports.push(new winston.transports.Console())
}

module.exports = function (err, req, res, next) {
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: "user-service" },
    transports: transports,
  });

  if (process.env.NODE_ENV !== "development") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      })
    );
  }

  logger.error(err.message, err);
  res.status(500).send("An Internal server Error Occurred");
};
