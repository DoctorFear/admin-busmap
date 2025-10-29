//---------- 2. Path ----------
//-----------------------------
const path = require('path')
const { FilePieChart, BedSingle } = require('lucide-react')

// 2.1 Show the platform-specific file separator. '\' or '/'.
console.log("- [2.1] The platform-specific file separator:", path.sep)

// 2.2 Create a path to file
// Get the current file directory
const currentDir = __dirname    // /home/nii/Documents/Busmap_admin/quy_learning/
const testPath_absolute = path.join(`${currentDir}`, 'practice', 'testing.txt')
console.log("- [2.2] testing.txt path:", testPath_absolute)

// Get the basename of file 
const base_testName = path.basename(testPath_absolute)
console.log("- [2.2] Basename:", base_testName)
