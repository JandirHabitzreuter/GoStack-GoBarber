// Configurações Obtidas pelo mailtrap : https://mailtrap.io/inboxes
export default {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // está utilizando SSL
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    default: {
        from: 'Equipe Gobarber <noreply@gobarber.com>',
    },
};
