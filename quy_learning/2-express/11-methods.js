/** --- POST --- \\
 *  - User (when submit, browser send to server):
 *      POST /login
        Content-Type: application/x-www-form-urlencoded
        Body: name=quy
 *  - Process:
        client → submit form → Express “parse” data → server read req.body → response res.send() 
 *  - Data flow:
        [Client Form]
            ↓ (POST /login)
        [HTTP Body: name=quy]
            ↓
        Express get request
            ↓
        app.use(express.urlencoded({extended: false}))  // parse body
            ↓
        req.body = { name: 'quy' }
            ↓
        app.post('/login', ...)                         // handle route
            ↓
        res.send('Client POST name: quy')
 */ 
const PORT_SERVER = 5555;
const express = require('express');
const app = express();

const people = require('./routes/people');
const auth = require('./routes/auth')

// --- MIDDLEWARE --- \\
// static assets
app.use(express.static('./methods-public'))
// parse from data
app.use(express.urlencoded({extended: false}))
// parse json
app.use(express.json())

/**  Router (MVC-style routing)
 *  - Express cung cấp lớp express.Router() để:
        Gom nhóm các route cùng chủ đề (ví dụ: /api/people, /api/auth, /api/products…)
        Tách mỗi nhóm ra một file riêng (module)
        Dễ dàng “ghép lại” vào app.js
*/
// Mount all router (people) to path: /api/people
// - That mean: 
//      + all route in people.js will be auto added prefix: /api/people
//          router.get('/')          →  /api/people
//          router.post('/')         →  /api/people
//          router.put('/:id')       →  /api/people/:id
//          router.delete('/:id')    →  /api/people/:id
// - Operate: Khi có request đến /api/people hoặc /api/people/*
//      app.use('/api/people', (req, res, next) => {
//          // Route (chuyển tiếp) request to router "people"
//          people(req, res, next)
//      })
app.use('/api/people', people)
// so, similar to auth:
app.use('/login', auth)


// --- LISTEN --- \\
app.listen(PORT_SERVER, () => {
    console.log('Server is listening on port', PORT_SERVER)
})