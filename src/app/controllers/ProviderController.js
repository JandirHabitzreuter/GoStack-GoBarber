import User from '../models/User';

class ProviderController {
    //index usado para listagem
async index(req, res){
    const providers = await User.findAll({
        where: {provider:true},


    });

    return res.json(providers);

}

}

export default new ProviderController();