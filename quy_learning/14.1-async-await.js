/*  ASYNC/AWAIT: Viết Promise gọn
*/
const {readFile} = require('fs').promises;
const path = './practice/sub/first.txt'

console.log("Declare async function")
async function showText(path){
    try{
        const result = await readFile(path, 'utf8')
        console.log(result)
    } catch(err){
        console.log(err)
    }
}
showText(path)

console.log("After call async function")


/* 
$ node "/home/nii/Documents/Busmap_admin/quy_learning/14.1-async-await.js"             ─╯
    Declare async function
    After call async function
    The first file for FileSyn 
*/