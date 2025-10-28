
//-------- 1. FileSync --------
// - Chương trình chờ đọc/ghi xong -> thực hiện tiếp
// - Node.js bị tạm dừng đến khi thao tác I/O hoàn tất.
// - Cấu trúc đơn giản, dễ đọc, nhưng có thể làm treo toàn bộ chương trình khi thao tác I/O lâu.
// => Khi viết script ngắn, xử lý file cục bộ, hoặc chạy một lần (ví dụ: import dữ liệu).
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
