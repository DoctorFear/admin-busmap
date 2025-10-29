var http = require('http')
var fs = require('fs')
const { start } = require('repl')
const { error } = require('console')

/* STREAM
    - Node không đọc toàn bộ file vào RAM, mà nó đọc từng phần nhỏ - chunk, default:64KB,
        + Khi một chunk được đọc, nó emit sự kiện 'data'
        + Khi hết file, nó emit sự kiện 'end' 
        + Nếu lỗi (file not found,...), emit sự kiện 'error'
    - Transfer data directly to client, not save to RAM
    - Non-blocking 
*/
/* stream & readFileSync:
| Tiêu chí                           | `readFileSync`                          | `createReadStream`                              |
| ---------------------------------- | --------------------------------------- | ----------------------------------------------- |
| **Cơ chế**                         | Đọc toàn bộ file vào bộ nhớ **một lần** | Đọc **từng phần nhỏ (chunk)**                   |
| **Blocking**                       | ⛔ Blocking (chặn luồng chính)           | ✅ Non-blocking (bất đồng bộ)                    |
| **Hiệu năng**                      | Tốn RAM nếu file lớn                    | Dùng RAM cực ít                                 |
| **Ứng dụng**                       | File nhỏ, đọc 1 lần                     | File lớn, streaming dữ liệu                     |
| **Phản hồi HTTP**                  | Chờ đọc xong mới gửi                    | Gửi dần từng phần cho client                    |
| **Khả năng mở rộng (scalability)** | Kém khi nhiều request đồng thời         | Rất tốt, do luồng nhẹ và không block event loop |


*/

http
    .createServer(function (req, res){
        //--- readFileSync: read all file
        // const text = fs.readFileSync('./practice/sub/big.txt', 'utf8')
        // res.end(text)

        //--- Stream: read chunk-2-chunk 
        // 1. Node open big.txt 
        const stream = fs.createReadStream('./practice/sub/big.txt', 'utf8')
        // 2. When file 'open', read chunk-2-chunk and push to 'res' - response, by pipe()
        stream.on('open', () => {
            // 3. pipe() connect to stream to read file and write (HTTP response)
            //  res (HTTP response object) trong Node cũng là một Writable Stream, nên có thể dùng .pipe().
            //--- Work: 
            // fileStream.on('data', chunk => res.write(chunk))
            // fileStream.on('end', () => res.end())
            // fileStream.on('error', err => res.end(err))
            // => Readable Stream → Writable Stream
            // or fs.ReadStream (file) → http.ServerResponse (client)
            stream.pipe(res)
        })
        stream.on('error', (err) => {
            res.end(err)
        })

        //--- Show each chunk value and size
        // stream.on('data', (chunk) => {
        //     console.log('- Chunk values:', chunk.toString())
        //     console.log('Received chunk of size:', chunk.length)
        // })
        // stream.on('end', () => {
        //     console.log('Finished reading file.')
        // })
        // stream.on('error', (err) => {
        //     console.error(err)
        // })
    })
    .listen(5555)