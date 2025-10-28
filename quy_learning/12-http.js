const http = require('http')

const server = http.createServer((req, res) => {
    if(req.url === '/'){
        res.end("Wow, you have visited my server, my home page")
    }
    if(req.url === '/about'){
        res.end("I don't know history of that page :))")
    }
    res.end(`
        <h1>Oops!</h1>
        <p>We can't seem to find the page which you want</p>
        <a href="/">Back to home</a>
    `)
})

server.listen(5555)

