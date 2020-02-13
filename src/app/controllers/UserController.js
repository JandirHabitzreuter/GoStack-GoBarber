const User = require('../models/User');
const Yup = require('yup');

class UserController {
    async store(req, res){
        const schema = Yup.object().shape({
            // .required = obrigatorio
            name: Yup.string().required,
            //.email valida a formatação de email se tem @ etc...
            email: Yup.string().email().required,

            // .min(6) senha tem que ter no minimo 6 digitos
            password: Yup.string().required().min(6)
        });

        if(!await schema.isValid(req.body)){
            return res.status(400).json({error: 'Validation fails.'});
        }


        const userExists = await User.findOne({where: {email: req.body.email}});

        if(userExists)  {
        return res.status(400).json({error: 'Users already exists.'});
        }

        const { id, name, email, provider} = await User.create(req.body);

        return res.json({
            id,
            name,
            email,
            provider

        });
    }

    async update(req, res){
        const schema = Yup.object().shape({

            name: Yup.string(),
            email: Yup.string().email(),
            oldPassword: Yup.string().min(6),
            Password: Yup.string()
                         .min(6)
                         .when('oldPassword', (oldPassword,field) =>
                         oldPassword ? field.require() : field
                         ),

        });

        if(!await schema.isValid(req.body)){
            return res.status(400).json({error: 'Validation fails.'});
        }

        const { email, oldPassword} = req.body;

                                         // req.userId vem do token
        const user = await User.findByPk(req.userId);

        if(email && (email != user.email)){
            const userExists = await User.findOne({where: {email}});

            if(userExists)  {
            return res.status(400).json({error: 'Users already exists.'});
            }
        }

      if(oldPassword && !(await user.checkPassword(oldPassword))){
        return res.status(401).json({error: 'Password does not match.'});

      }

      const { id, name, provider} = await user.update(req.body);

      return res.json({
        id,
        name,
        email,
        provider

        });
    }


}

module.exports = new UserController();
