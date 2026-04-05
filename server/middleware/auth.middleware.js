const jwt = require ("jsonwebtoken");


const protect = async (req, res, next) => {
    try{
        //check header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({ message :'No Token Provided, authorization denied'})
        }
        // Extract token
        const token = authHeader.split(' ')[1];
        //verify token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id : decoded.id,
            role : decoded.role
        };
        next();
    } catch (error){
        if ( error.name =='TokenExpiredError') {
            return res.status(401).json({ message : 'Token expired, Please Login again'});
        }
        if ( error.name == 'JsonWebTokenError'){
            return res.status(401).json({message : 'Invalid Token'});
        }
        console.error('Auth middleware error :', error);
        res.status(500).json({message : 'Server error'});
    }

};

module.exports = { protect };