// --- SETUP & IMPORT ---\\
const PORT_SERVER = 5555
const express = require('express')
const app = express()
// data
const data = require('./data.js')

// --- BASIC ---\\
app.get('/', (req, res) => {
    // res.json([
    //     {name: 'doduyquy'},
    //     {age: 21}
    // ])
    // res.json(data.products)
    res.status(200).send('<h1>Home page</h1><a href="/api/products">API Products</a>')
})
// --- Send all fields in products:
app.get('/api/products_all', (req, res) => {
    // res.status(200).send(data.products)
    res.status(200).json(data.products)
})
// --- Send some fields in products:
app.get('/api/products', (req, res) => {
    const newProducts = data.products.map((product) => {
        const {id, name, image} = product
        return {id, name, image}
    })
    // Send to client
    res.status(200).json(newProducts)
})

// --- [PARAMS] Send single product --- \\
// :productID: dynamic parameter
// | URL client gửi      | `req.params` nhận được |
// | ------------------- | ---------------------- |
// | `/api/products/1`   | `{ productID: '1' }`   |
// | `/api/products/5`   | `{ productID: '5' }`   |
// | `/api/products/123` | `{ productID: '123' }` |
app.get('/api/products/:productID', (req, res) => {
    // console.log('- Client request:', req);
    // console.log(' + Params:', req.params)
    const {productID} = req.params;
    const singleProduct = data.products.find(
        (product) => product.id == Number(productID)
    )
    // If data don't contain:
    if(!singleProduct){
        res.status(404).send("Ohh, we don't have that product!")
    }
    // Return the single product which is requested by client
    res.status(200).json(singleProduct)
})

// --- QUERY ---\\
app.get('/api/v1/query', (req, res) => {
    console.log('- Client query:', req.query)
    
    // Get content of query
    const {search, limit} = req.query
    let sortedProducts = [...data.products]

    if(search) {
        sortedProducts = sortedProducts.filter((product) => {
            return product.name.startsWith(search)
        })
    }
    if(limit) {
        sortedProducts = sortedProducts.slice(0, Number(limit))
    }
    if(sortedProducts.length < 1){
        // return res.status(200).send('Ohh, no product found')
        return res.status(200).json({success: true, data: []})
    }
    
    // res.status(200).json(sortedProducts)
    res.status(200).json({success: true, data: sortedProducts})
})



// handle exception
app.use((req, res) => {
    res.status(404).send('Oops! Wrong way!')
})

app.listen(PORT_SERVER, () => {
    console.log('[server] Server is listening on port', PORT_SERVER)
})