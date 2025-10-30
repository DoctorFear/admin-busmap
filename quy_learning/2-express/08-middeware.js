/** MIDDLEWARE
 *      Client(request) → Middleware → Route Handler → Response
 *  Or:
 *          req --> middleware --> res
 */
const PORT_SERVER = 5555
const express = require('express')
const app = express()

const {logger, loggerCalTime} = require('./logger.js')
const authorize = require('./authorize.js')

// Global, use for all route 
// ~ : app.get('path', logger, anotherLogger, handler)
app.use('/', [logger, authorize])

// app.get(path, [middleware1, middleware2, ...], handler)
app.get('/', loggerCalTime, (req, res) => {
    res.status(200).send('Home page')
})
app.get('/about', (req, res) => {
    res.status(200).send('About')
})

app.get('/api/products', (req, res) => {
    res.status(200).send('Products')
})


app.listen(PORT_SERVER, () => {
    console.log('Server is listening on port:', PORT_SERVER)
})