import pt from 'date-fns/locale/pt';
import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class CancellationMail {
    get Key() {
        // Chave unica
        return 'CancellationMail';
    }

    async handle({ data }) {
        const { appointment } = data;

        await Mail.sendMail({
            to: `${appointment.provider.name} <${appointment.provider.email}>`,
            subject: 'Agendamento cancelado',
            template: 'cancelations',
            context: {
                provider: appointment.provider.name,
                user: appointment.user.name,
                date: format(
                    parseISO(appointment.date),
                    // aspas simples não formata o texto
                    // Sem aspas ele substitui o texto
                    " 'dia' dd 'de' MMMM', ás' H:mm'hrs'",
                    // Por padrão trás o mês em Inglês, então traduzir para português usando o locale
                    { locale: pt }
                ),
            },
        });
    }
}

export default new CancellationMail();
