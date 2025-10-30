const { default: next } = require("next")

const logger = (req, res, next) => {
    const method = req.method
    const url = req.url
    const time = new Date().getFullYear()
    console.log(method, url, time)

    next()      // ***
}
const loggerCalTime = (req, res, next) => {
    const start =  Date.now()

    // Calculate time:
    res.on('finish', () => {
        const time = Date.now() - start
        console.log(`- Completed in ${time}ms`)
    })

    next()      // ***
}

module.exports = {
    logger,
    loggerCalTime
}