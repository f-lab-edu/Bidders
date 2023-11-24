import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { ConfigService } from '@nestjs/config';
import { User } from '@libs/entity';

describe('JwtService', () => {
    let service: JwtService;
    let token: string;

    beforeEach(async () => {
        const configService: Partial<ConfigService> = {
            get: (key: string) => key,
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtService,
                { provide: ConfigService, useValue: configService },
            ],
        }).compile();

        service = module.get(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('creates jwt', () => {
        token = service.create(
            {
                id: 1,
                email: 'test@test.com',
            } as User,
            '1h',
        );
        expect(token).toBeDefined();
    });

    it('verifies jwt', () => {
        const payload = service.verify(token);
        expect(payload).toBeDefined();
    });

    it('throws if wrong token is provided', () => {
        /**
         *  expect 함수에 service.verify 함수를 실행하는 함수가 전달
         *  테스트하려는 함수가 예외를 발생시킬 때 사용하는 방식
         */
        expect(() => service.verify('wrong.token.format')).toThrowError(Error);
    });
});
