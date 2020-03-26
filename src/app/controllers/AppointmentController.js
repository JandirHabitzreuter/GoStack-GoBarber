import * as Yup from 'yup';
import pt from 'date-fns/locale/pt';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notificaton';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationsMail';

class AppointmenteController {
    // no attributes sempre tem que retornar o Id

    async index(req, res) {
        const { page = 1 } = req.query;
        const appointments = await Appointment.findAll({
            where: { user_id: req.userId, canceled_at: null },
            order: ['date'],
            attributes: ['id', 'date', 'past', 'cancelable'],
            // listar 20 registros
            limit: 20,
            // Quantos registros vai pular
            offset: (page - 1) * 20,
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id', 'path', 'url'],
                        },
                    ],
                },
            ],
        });

        return res.json(appointments);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            date: Yup.date().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails.' });
        }

        const { provider_id, date } = req.body;

        const isProvider = await User.findOne({
            where: { id: provider_id, provider: true },
        });

        if (!isProvider) {
            return res.status(401).json({
                error: 'You can only create appointment with providers.',
            });
        }

        // Pega data e horario sem minutos
        const hourStart = startOfHour(parseISO(date));

        // Vai testar se a data de agendamento é pro passado, se for não vai permitir agendar
        if (isBefore(hourStart, new Date())) {
            return res
                .status(400)
                .json({ error: 'Past date are not permitted.' });
        }

        // Vai verificar se existe um agendamento para aquela data com o provider
        const checkAvailability = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart,
            },
        });

        if (checkAvailability) {
            return res
                .status(400)
                .json({ error: 'Appointment date is not available.' });
        }

        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date: hourStart,
        });

        const user = await User.findByPk(req.userId);
        const formattedDate = format(
            hourStart,
            // aspas simples não formata o texto
            // Sem aspas ele substitui o texto
            " 'dia' dd 'de' MMMM', ás' H:mm'hrs'",
            // Por padrão trás o mês em Inglês, então traduzir para português usando o locale
            { locale: pt }
        );

        // Inserindo as notificações com mongoDB
        await Notification.create({
            content: `Novo agendamento de ${user.name} 
                     para ${formattedDate}`,
            user: provider_id,
        });

        return res.json(appointment);
    }

    async delete(req, res) {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['name', 'email'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['name'],
                },
            ],
        });

        if (appointment.user_id !== req.userId) {
            return res.status(401).json({
                error: "you don't have permission to cancel this appointment",
            });
        }

        // remove 2 horas da data de agendamento
        const dateWithSub = subHours(appointment.date, 2);

        if (isBefore(dateWithSub, new Date())) {
            return res.status(401).json({
                error: 'you can only cancel appointment 2 horus in advance',
            });
        }

        appointment.canceled_at = new Date();

        await appointment.save();
        await Queue.add(CancellationMail.key, {
            appointment,
        });

        return res.json(appointment);
    }
}

export default new AppointmenteController();
