import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { userJamesSmith } from 'test/data/users';

describe('TokenService', () => {
  let tokenService: TokenService;
  let jwtService: JwtService;

  beforeEach(async () => {
    process.env.SECRET = 'mocked-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verify: jest.fn().mockImplementation((token) => {
              if (token === 'valid-token') return { id: userJamesSmith.id, email: userJamesSmith.email };
              throw new Error('Invalid token');
            }),
          },
        },
      ],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(tokenService).toBeDefined();
  });

  describe('createToken', () => {
    it('should return a signed JWT token', () => {
      const payload = { id: userJamesSmith.id, email: userJamesSmith.email };
      const token = tokenService.createToken(payload);

      expect(token).toBe('mocked-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith(payload, { secret: 'mocked-secret' });
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const decoded = tokenService.verifyToken('valid-token');

      expect(decoded).toEqual({ id: userJamesSmith.id, email: userJamesSmith.email });
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', { secret: 'mocked-secret' });
    });

    it('should throw an error for an invalid token', () => {
      expect(() => tokenService.verifyToken('invalid-token')).toThrow('Invalid token');
    });
  });

});
