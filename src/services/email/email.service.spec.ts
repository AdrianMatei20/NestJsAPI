import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import * as emailjs from '@emailjs/nodejs';

jest.mock('@emailjs/nodejs', () => ({
  init: jest.fn(),
  send: jest.fn(),
}));

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(emailService).toBeDefined();
  });

  describe('sendRegistrationEmail', () => {

    it('should send a registration email successfully', async () => {
      (emailjs.send as jest.Mock).mockResolvedValue({ status: 200, text: 'OK' });

      const result = await emailService.sendRegistrationEmail(
        'test@example.com',
        'Test User',
        'https://example.com/verify'
      );

      expect(result).toBe(true);
      expect(emailjs.send).toHaveBeenCalledWith(
        process.env.EMAIL_JS_SERVICE_ID,
        process.env.EMAIL_JS_TEMPLATE_ID,
        expect.objectContaining({
          to_email: 'test@example.com',
          to_name: 'Test User',
        })
      );
    });

    it('should return false if email sending fails', async () => {
      (emailjs.send as jest.Mock).mockRejectedValue(new Error('Email service error'));

      const result = await emailService.sendRegistrationEmail(
        'test@example.com',
        'Test User',
        'https://example.com/verify'
      );

      expect(result).toBe(false);
      expect(emailjs.send).toHaveBeenCalled();
    });

  });

  describe('sendResetPasswordEmail', () => {

    it('should send a reset password email successfully', async () => {
      (emailjs.send as jest.Mock).mockResolvedValue({ status: 200, text: 'OK' });

      const result = await emailService.sendResetPasswordEmail(
        'test@example.com',
        'Test User',
        'https://example.com/reset'
      );

      expect(result).toBe(true);
      expect(emailjs.send).toHaveBeenCalledWith(
        process.env.EMAIL_JS_SERVICE_ID,
        process.env.EMAIL_JS_TEMPLATE_ID,
        expect.objectContaining({
          to_email: 'test@example.com',
          to_name: 'Test User',
        })
      );
    });

    it('should return false if reset password email sending fails', async () => {
      (emailjs.send as jest.Mock).mockRejectedValue(new Error('Email service error'));

      const result = await emailService.sendResetPasswordEmail(
        'test@example.com',
        'Test User',
        'https://example.com/reset'
      );

      expect(result).toBe(false);
      expect(emailjs.send).toHaveBeenCalled();
    });

  });
});
