/* Promise: object đại diện cho một gía trị sẽ có trong tương lai.

--- 3 trạng thái của Promise:

| Trạng thái    | Khi nào                  | Ý nghĩa                                |
| ------------- | ------------------------ | -------------------------------------- |
| **Pending**   | Khi Promise vừa được tạo | Đang chờ kết quả (chưa resolve/reject) |
| **Fulfilled** | Khi gọi `resolve(value)` | Thành công, có kết quả `value`         |
| **Rejected**  | Khi gọi `reject(error)`  | Bị lỗi, có lỗi `error`                 |

*/

const {readFile} = require('fs')
const path = './practice/sub/first.txt'
// function getText(path){
//      return new Promise(...)
// }

// arrow function
const getText = (path) => {
    return new Promise((resolve, reject) => {
        readFile(path, 'utf8', (err, data) => {
            if (err) { reject(err)}
            else { resolve(data)}
        })
    })
}
getText([path])
    .then(result => console.log(result))
    .catch(err => console.log(err))





