
//------ 1. Asynchronous ------
// - Gọi hàm và tiếp tục thực hiện các lệnh khác. Kết quả trả về thông qua callback function.
// - Non-blocking I/O (bất đồng bộ). Node.js không bị “đứng” khi file còn đang đọc/ghi.
// - Dùng callback (hoặc Promise/async-await) nên dễ bị callback hell nếu lồng nhiều thao tác.
// - Khi xây dựng web server, API backend, hoặc app có nhiều người dùng truy cập đồng thời.
//-----------------------------

const {readFile, writeFile} = require('fs')

console.log('- Start asynchronous read and write file')
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

console.log('- Start next task')

