const {writeFile, write} = require('fs').promises;
async function createBigFile(n = 1000){
    for (let i = 1; i < n; i++){
        await writeFile(
            './practice/sub/big.txt',
            `Hello guy ${i}\n`,
            {flag: 'a'}
        )
    }
}

createBigFile(111111)