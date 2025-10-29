/*  default 64kb
    last buffer - remainder
    highWaterMark - control size
    const stream = createReadStream('./practice/sub/big.txt', {highWaterMark: 15000})
    const stream = createReadStream('./practice/sub/big.txt', {encoding: 'utf8'})
*/

const {createReadStream} = require('fs');
const stream = createReadStream('./practice/sub/big.txt', {
    highWaterMark: 15000, 
})

stream.on('data', (res) => {
    console.log(res)
})