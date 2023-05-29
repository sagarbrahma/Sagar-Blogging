const jwt = require('jsonwebtoken');

class AuthJwt {
    async authJwt(req, res, next) {
        try {
            if(req.cookies && req.cookies.adminToken) {
                jwt.verify(req.cookies.adminToken, 'A1B2C3D4E5', (err, data) => {
                    if(!err) {
                        req.admin = data;
                        next();
                    }else {
                        console.log(err);
                        next();
                    }
                })
            }else {
                next();
            }
        }catch(err) {
            throw err;
        }
    }
}


module.exports = new AuthJwt();