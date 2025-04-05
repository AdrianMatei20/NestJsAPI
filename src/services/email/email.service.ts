import { Injectable } from '@nestjs/common';
import { RegistrationEmailTemplateParams, ResetPasswordEmailTemplateParams } from 'src/shared/utils/types';
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

    async sendRegistrationEmail(receiverEmail: string, receiverName: string, link: string): Promise<boolean> {
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
        } catch (error) {
            return false;
        }

        return true;
    }

    async sendResetPasswordEmail(receiverEmail: string, receiverName: string, link: string): Promise<boolean> {
        try {
            const params: ResetPasswordEmailTemplateParams = {
                to_email: receiverEmail,
                from_email: this.OFFICIAL_EMAIL_ADDRESS,
                to_name: receiverName,
                subject: 'TaskFlow password reset',
                message: 'Click this link to reset your password',
                link: link,
            }
            const response = await emailjs.send(
                process.env.EMAIL_JS_SERVICE_ID,
                process.env.EMAIL_JS_TEMPLATE_ID,
                params,
            );
        } catch(error) {
            return false;
        }

        return true;
    }

}
