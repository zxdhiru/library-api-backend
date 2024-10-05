require("dotenv").config()
const PORT = process.env.PORT
const MONGOOSE_URL = process.env.MONGOOSE_URL

module.exports = {
    PORT, MONGOOSE_URL
}