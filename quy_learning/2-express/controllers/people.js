let { people } = require('../data')

// Declare all function
const getPeople = (req, res) => {     // because we route: app.use('/api/people', people), in 11-methods.js
    res.status(200).json({success:true, data:people})
}

const createPerson = (req, res) => {
    const { name } = req.body
    if(!name) {
        return res 
            .status(400)
            .json({success:false, msg: 'Ohh, name is empty, guy!'})
    }
    res.status(201).send({success:true, person: name})
}

const updatePerson = (req, res) => {
    const { id } = req.params
    const { name } = req.body
    // find person with id
    const person = people.find((p) => p.id === Number(id))
    
    if(!person){    // if not existed, return 
        return res
            .status(404)
            .json({success: false, msg: `id-${id} not match with any person`})
    } 
    /** NOTE when using arrow function
     *     1. arr.map((n) => n * 2)
     *          - Function only have ONE expression: n * 2
     *          - So, JS auto return express's result
     *          - That line equivalent:
     *              arr.map(function(n){
                        return n * 2
                    })   
     *          -> IMPLICIT RETURN
     *                    
     *      2.  arr.map((n) => {
                    n * 2   // not have return => return nothing
                })
     *          - It's only a block of code, not have return 
     *          - So, function with return 'undefined' by default
     */
    // if existed, update name
    const newPeople = people.map((p) => {
        if(p.id === Number(id)){
            return {...p, name}   // return new object with updated name
        }
        return p    // return original if not match
    })
    return res  
        .status(200)
        // .json({success: true, data: newPeople, msg: `Update successfully. ID - ${id}`})
        .json({success: true, data: newPeople, msg:`Update name successfully for ID - ${id}`})

}

const deletePerson = (req, res) => {
    const { id } = req.params
    let isExisted = false
    // Check if id is existed?
    people.forEach((p) => {
        if(p.id === Number(id)){
            isExisted = true
            return
        }
    })
    if(!isExisted){    // if not existed, return 
        return res
            .status(404)
            .json({success: false, msg: `id-${id} not existed`})
            
    } 
    // if existed, delete
    const newPeople = people.filter((p) => p.id !== Number(id))
    return res  
        .status(200)
        // .json({success: true, data: newPeople, msg: `Update successfully. ID - ${id}`})
        .json({success: true, data: newPeople, msg:`- Deleted people with ID - ${id}`})
}

// Export
module.exports = {
    getPeople,
    createPerson, 
    updatePerson,
    deletePerson
}