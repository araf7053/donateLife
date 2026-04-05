// Generic validatore - pass in an array of required field names

const validateFields = (...fields) => {
    return (req, res, next) => {
        // 1. Safety check: ensure req.body actually exists
        if (!req.body) {
             return res.status(400).json({ message: 'Malformed request: body is missing' });
            }
        const missing = fields.filter(field =>{
            const value = req.body[field];
            return value === undefined || value === null || value === '';
        });
        if (missing.length > 0){
            return res.status(400).json({
                message : `Missing required fields : ${missing.join(', ')}`
            });
        }
        next();
    };
};
module.exports = { validateFields }