
//-------- 1. FileSync --------
//-----------------------------

const {readFileSync, writeFileSync} = require('fs');

// 1.1 Read from file
const firstFile = readFileSync('./practice/sub/first.txt', 'utf8')
const secondFile = readFileSync('./practice/sub/second.txt', 'utf8')
console.log("- [1.1] Read file using FileSync:", firstFile, secondFile)

// 1.2 Write to file
pathToWrite = "./practice/sub/writeWithSync.txt"
data = "This content is written by writeFileSync"
writeFileSync(
    pathToWrite, 
    `${data}\n${firstFile}\n${secondFile}\n`,
    { flag: 'a'}
)

console.log("- Result after write:\n", readFileSync(pathToWrite, 'utf8'))
