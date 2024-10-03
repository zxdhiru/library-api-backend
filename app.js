const express = require('express');
const { default: mongoose } = require('mongoose');
const cors = require("cors")

const app = express()
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.method, req.path, req.query);
    next()
})

app.use(cors())

// Routes
const bookRoute = require('./features/books/routes');
app.use('/api/v1/books', bookRoute)
const studentRoute = require('./features/students/routes')
app.use('/api/v1/students', studentRoute)
const authorRoute = require('./features/authors/routes')
app.use('/api/v1/authors', authorRoute)
const transactionRoute = require('./features/transactions/routes')
app.use('/api/v1/transactions', transactionRoute)


// Connect to DB and start the server
function startServer(DB_URL, PORT) {
    mongoose.connect(DB_URL)
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Successfully connected to database & Listening on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.log('Database connection error:', error);
        });
}

module.exports = startServer