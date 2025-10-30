const express = require('express')
const router = express.Router()


// router.get('/', (req, res) => {
//   res.send(`
//     <form action="/login" method="POST">
//       <input type="text" name="name" placeholder="Enter your name" />
//       <button type="submit">Login</button>
//     </form>
//   `)
// })

// POST: login
router.post('/', (req, res) => {    
    const { name } = req.body
    if(name){
        return res.status(200).send(`Hi guy, ${name}` )
    } 
    res.status(401).send('Not found that name!')
})

module.exports = router