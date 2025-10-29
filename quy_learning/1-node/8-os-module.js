//----------- 1. OS -----------
//-----------------------------
const os = require('os')

// 1.1 Show the info about the current use
const current_user = os.userInfo()
console.log("- [1.1] Current user:\n", current_user);
// 1.2 Method return the system uptime seconds
systemTimeSecond = os.uptime()
console.log(`- [1.2] The system uptime is: ${systemTimeSecond} seconds`)

// 1.3 Object
const currentOS = {
    name: os.type(),
    release: os.release(),
    totalMemGB: os.totalmem() / 1024**3,
    freeMemGB: os.freemem() / 1024**3,
}
currentOS.usedMemGB = currentOS.totalMemGB - currentOS.freeMemGB

console.log(`- [1.3] CurrentOS object: `, currentOS)


