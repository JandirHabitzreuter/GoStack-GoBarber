import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import *  as Yup from 'yup';
import { startOfDay, endOfDay, parseISO} from 'date-fns';
import {Op} from 'sequelize';


class ScheduleController {
    // no attributes sempre tem que retornar o Id   

    async index(req, res){
        
       const checkUserProvider = await User.findOne(
        {where : {id : req.userId, provider:true},        
        }
       );

       if (!checkUserProvider){
        return res.status(401).json({error: 'User is not provider.'});
       }

       const { date } = req.query;
       const parsedDate = parseISO(date);

       const appointments = await Appointment.findAll({
        where: {
            provider_id:req.userId,
            canceled_at:null,
            date:{
                [Op.between]: [
                    startOfDay(parsedDate),
                    endOfDay(parsedDate),                                
                ]
            },
        },
        order: ['date'],
       });
    
        return res.json(appointments);
    
    }



    async store(req, res){
        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            date : Yup.date().required(),
        });          
        
        if(!(await schema.isValid(req.body))){
            return res.status(400).json({error: 'Validation fails.'});
        }

        const { provider_id, date} = req.body;

        const isProvider = await User.findOne({
              where : {id:provider_id, provider:true},  
        });

       if(!isProvider){
        return res.status(401).json({error: 'You can only create appointment with providers.'});

       } 

       // Pega data e horario sem minutos
       const hourStart = startOfHour(parseISO(date));

       // Vai testar se a data de agendamento é pro passado, se for não vai permitir agendar
       if (isBefore(hourStart, new Date())){
        return res.status(400).json({error: 'Past date are not permitted.'}); 
       }

       // Vai verificar se existe um agendamento para aquela data com o provider
       const checkAvailability = await Appointment.findOne({
           where: {
               provider_id,
               canceled_at:null,
               date:hourStart,
           },
       });


       if (checkAvailability){
        return res.status(400).json({error: 'Appointment date is not available.'}); 
       }


       const appointment = await Appointment.create({
           user_id:req.userId,
           provider_id,
           date:hourStart,
       });

       return res.json(appointment);
    }
}


export default new ScheduleController();