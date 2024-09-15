import { Injectable } from '@nestjs/common';
import { RegistrationEmailTemplateParams } from 'src/shared/utils/types';
import emailjs from '@emailjs/nodejs';

@Injectable()
export class EmailService {

    constructor() {
        emailjs.init({
            publicKey: process.env.EMAIL_JS_PUBLIC_KEY,
            privateKey: process.env.EMAIL_JS_PRIVATE_KEY,
        });
    }

    private readonly OFFICIAL_EMAIL_ADDRESS: string = 'taskflow@noreply.com';

    async sendRegistrationEmail(receiverEmail: string, receiverName: string, link: string) {
        try{
            var params: RegistrationEmailTemplateParams = {
                to_email: receiverEmail,
                from_email: this.OFFICIAL_EMAIL_ADDRESS,
                to_name: receiverName,
                subject: 'Welcome to TaskFlow!',
                message: 'Please confirm your account by clicking the link below',
                link: link,
            }
            const response = await emailjs.send(
                process.env.EMAIL_JS_SERVICE_ID,
                process.env.EMAIL_JS_TEMPLATE_ID,
                params,
            );
            console.log(response);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

}
