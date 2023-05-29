const jwt = require('jsonwebtoken');

class UserAuth {
    async userAuth(req, res, next) {
        try {
            if(req.cookies && req.cookies.userToken) {
                jwt.verify(req.cookies.userToken, 'B1U2M3B4A5', (err, data) => {
                    if(!err) {
                        req.user = data;
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


module.exports = new UserAuth();