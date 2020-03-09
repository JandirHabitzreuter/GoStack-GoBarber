import { Model } from 'sequelize';
import Sequelize from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model{
    static init(sequelize){
        super.init({
            name: Sequelize.STRING,
            email: Sequelize.STRING,
            password : Sequelize.VIRTUAL,
            password_hash: Sequelize.STRING,
            provider: Sequelize.BOOLEAN,

        },
        {
            sequelize
        }

        );
        //Vai ser executado antes do usuario ser criado
        this.addHook('beforeSave', async (user) => {

         if(user.password) {
            user.password_hash = await bcrypt.hash(user.password, 8);
         }

        });
      return this;
    }

    // Relacionar esse model com o de file
    static associate(models){
        this.belongsTo(models.File, { foreignKey: 'avatar_id', as:'avatar'});
    }

    checkPassword(password){
        console.log(password);
        return bcrypt.compare(password, this.password_hash);

    }


}

export default User;

