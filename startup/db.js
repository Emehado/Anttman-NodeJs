const mongoose = require("mongoose");
const winston = require("winston");
const config = require("config");

module.exports = function () {
    const db = config.get("DB_URI");
    if (process.env.NODE_ENV === "development") {
        winston.add(new winston.transports.Console());
    }
    winston.add(new winston.transports.File({filename: "db.log"}));

    mongoose
        .connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
            retryWrites: false
        })
        .then(() => winston.info(`connected to database ${db}`));
};
