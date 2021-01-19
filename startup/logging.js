const winston = require("winston");
require("express-async-errors");
module.exports = function () {
    const transports = [new winston.transports.File({filename: "exceptions.log"})]
    if (process.env.NODE_ENV === 'development') {
        transports.push(new winston.transports.Console())
    }
    winston.createLogger({
        level: "info",
        format: winston.format.json(),
        defaultMeta: {service: "user-service"},
        transports: transports,
        exceptionHandlers: transports,
    });

    process.on("unhandledRejection", (err) => {
        throw err;
    });
};

// throw new Error("something failed");
// const p = Promise.reject(new Error("Promise Rejected"));
// p.then(() => console.log("Done"));
