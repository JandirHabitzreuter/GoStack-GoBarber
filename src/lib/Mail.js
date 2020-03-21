import nodemailer from 'nodemailer';
import mailConfig from '../config/mail';

class Mail {
    constructor(){
        const { host, port, secure , auth} = mailConfig;
        this.transporter = nodemailer.createTransport({
            host,
            port, 
            secure,
            // Se existe user passa ele senão passa null
            auth: auth.user ? auth : null,

        });
    }

    sendMail(message){
        return this.transporter.sendMail({
            ...mailConfig.default,
            ...message,
        });

    }

}

export default new Mail();