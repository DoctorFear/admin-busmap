/** HTTP response status code: 
 * Informational:       100-199
 * Successful:          200-299
 * Redirects:           300-399
 * Client errors:       400-499
 * Server errors:       500-599
 */

const http = require('http');
const {readFileSync} = require('fs');

// Get all page (need for website)
const homePage = readFileSync('./navbar-app/index.html')
const homeLogic = readFileSync('./navbar-app/browser-app.jss')
const homeStyles = readFileSync('./navbar-app/styles.css')
const homeImage = readFileSync('./navbar-app/logo.svg')

// Create the server
const server = http.createServer((req, res) => {
    // Log the method & url of request:
    console.log("- Method:",req.method);
    console.log("- URL:", req.url);

    // Get the url of client's request
    const url = req.url;
    // home page
    if(url === '/'){
        // Write (send) the response to client
        res.writeHead(200, {'content-type': 'text/html'})
        /** Browser send a lot of request to server to load data which is referenced in index.html
         *  | URL               | Ý nghĩa                                  |
            | ----------------- | ---------------------------------------- |
            | `/`               | lấy file `index.html`                    |
            | `/styles.css`     | lấy CSS cho giao diện                    |
            | `/browser-app.js` | lấy file JavaScript của trang            |
            | `/logo.svg`       | lấy hình logo hiển thị                   |
            | `/favicon.ico`    | lấy icon nhỏ ở tab trình duyệt (favicon) |
         */
        res.write(homePage)
        res.end()
    // homeLogic
    } else if(url === '/browser-app.js') {
        res.writeHead(200, {'content-type': 'text/javascript'})
        res.write(homeLogic)
        res.end()
    // home style
    } else if(url === '/styles.css') {
        res.writeHead(200, {'content-type': 'text/css'})
        res.write(homeStyles)
        res.end()
    // home image
    } else if(url === '/logo.svg') {
        res.writeHead(200, {'content-type': 'image/svg+xml'})
        res.write(homeImage)
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



/** EXPRESS

const express = require('express');
const app = express();

app.use(express.static('./navbar-app')); // serve toàn bộ thư mục

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/navbar-app/index.html');
});

app.listen(5555);

 */