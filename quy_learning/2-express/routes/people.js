const express = require('express')
const router = express.Router()
const {
    getPeople,
    createPerson, 
    updatePerson,
    deletePerson
} = require('../controllers/people')

// --- GET --- \\
router.get('/', getPeople)
// Or we can use:
// router.route('/').get(getPeople)

// --- POST --- \\
router.post('/', createPerson)
// (req, res) => {
//     const {name} = req.body
//     if(!name){
//         return res
//             .status(400)
//             .json({success:false, msg:'Hey, provide the name value'})
//     }
//     /**  NOTE: ... (spread operator)
//      *      const arr1 = [1, 2, 3]
//             const arr2 = [...arr1, 4, 5]
//             console.log(arr2) // --> [1, 2, 3, 4, 5]

//      */
//     res.status(201).json({success:true, data: [...people, name]})
// } )


// --- PUT --- \\
router.put('/:id', updatePerson)
// --- DELETE --- \\
router.delete('/:id', deletePerson)


// Export 
module.exports = router