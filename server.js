const startServer = require("./app");
const { MONGOOSE_URL, PORT } = require("./config");

startServer(MONGOOSE_URL, PORT)