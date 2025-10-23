//----------- 0. Basic -----------
// const { symbolName } = require('typescript')
// const name = require('./4-names')
// const sayHello = require('./5-utils')

// const { imageOptimizer } = require("next/dist/server/image-optimizer");

// // console.log(name)
// sayHello('twilight')
// sayHello(name.peter)

const {readFile, writeFile} = require('fs')

readFile('./practice/sub/first.txt', 'utf8', (err, res) => {
    // If reading the first file has error
    if (err) {
        console.log("- Read the first file, err:", err)
        return
    }
    const first = res

    // Read the next file
    readFile('./practice/sub/second.txt', 'utf8', (err, res) => {
        if (err){
            console.log("- Read the second file, err:", err)
            return
        }
        const second = res
        
        // If success, write to file
        writeFile(
            './practice/sub/writeFileAsync.txt',
            `This is written by writeFile (async)\n${first}\n${second}`,
            (err, res) => {
                if(err){
                    console.log("- Write file, err:", err)
                    return
                }
                console.log("- Write file successfully. Res:", res)
            }
        )
    })
})

