const jwt = require('jsonwebtoken');

const User = require('../models/User');


class SessionController{
    async store(req, res){
        const { email, password} = req.body;
        const user = await User.findOne({where:{email}});

        if(!user){
            return res.status(401).json({error: 'User not found!'});
        }

        if(!(await user.checkPassword(password))){
            return res.status(401).json({error: 'Password not match!'});

        }

        const { id, name} = user;

        return res.json({
            user:{
                id,
                name,
                email,
            },
            token: jwt.sign({id},
                            'bb3c5ad9039fd96f77f850c94325ec29',
                             {
                              expiresIn:'7d',
                             }

            );


        });
    }


}

module.exports = new SessionController();
