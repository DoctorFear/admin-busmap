/** HTTP response status code: 
 * Informational:       100-199
 * Successful:          200-299
 * Redirects:           300-399
 * Client errors:       400-499
 * Server errors:       500-599
 */

const http = require('http');

const server = http.createServer((req, res) => {
    // Log the method of request:
    console.log("- Method:",req.method);
    // Log the url of req:
    console.log("- URL:", req.url);

    const url = req.url;
    // home page
    if(url === '/'){
        // Write (send) the response to client
        res.writeHead(200, {'content-type': 'text/html'})
        res.write(`
            <h1>Home page</h1>    
        `)
        res.end()
    // about page
    } else if(url === '/about') {
        res.writeHead(200, {'content-type': 'text/html'})
        res.write(`
            <h1>About page</h1>    
            <p>I don't know what to talk!</p>
        `)
        res.end()
    // 404
    } else {
        res.writeHead(404, {'content-type': 'text/html'})
        res.write('<h1>Page not found</h1>')
        res.end()
    }


});

server.listen(5555);