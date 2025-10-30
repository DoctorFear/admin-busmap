const authorize = (req, res, next) => {
    const {user} = req.query
    if(user === 'nii'){
        req.user = {name: 'nii', id: 1}
        console.log('Yeah, access successfully')
        next()
    } else {
        res.status(401).send("Permission denied!")
    }
}

module.exports = authorize