export interface RegistrationEmailTemplateParams {
    to_email: string;
    from_email: string;
    to_name: string;
    subject: string;
    message: string;
    link: string;
    [key: string]: unknown;
}