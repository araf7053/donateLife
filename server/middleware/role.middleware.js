const authorize = (...roles) =>{
    return ( req, res, next) => {
        if(!req.user){
            return res.status(401).json({ message : 'Not Authenticated'});
        }
        if (!roles.includes(req.user.role)){
            return res.status(403).json({
                message : `Access denied. Required role : ${roles.join(' or ')}`
            });
        }
        next()
    };
};

module.exports = { authorize };

// Usage :  authorize ('admin', 'donor')