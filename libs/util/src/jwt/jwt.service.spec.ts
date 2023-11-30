import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'apps/api/src/user/entities/user.entity';
import { RedisClientService } from '@libs/database';
import { IExpireOpt, IUserPayload } from './interfaces';

describe('JwtService', () => {
    let service: JwtService;
    let fakeConfigService: Partial<ConfigService>;
    let fakeRedisClientService: Partial<RedisClientService>;
    let token: string;
    const memory = {};

    beforeEach(async () => {
        fakeConfigService = {
            get: (key: string) => key,
        };

        fakeRedisClientService = {
            setRtk: (key: string, value: string, expiration: string) => {
                memory[key] = value;
                return Promise.resolve();
            },
            getRtk: (key: string) => {
                return Promise.resolve(memory[key]);
            },
            deleteRtk: (key: string) => {
                delete memory[key];
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtService,
                { provide: ConfigService, useValue: fakeConfigService },
                {
                    provide: RedisClientService,
                    useValue: fakeRedisClientService,
                },
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
                id: 'uuid',
                email: 'test@test.com',
            } as User,
            '1h',
        );
        console.log('token', token);
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

    it('generates tokens and validates token', async () => {
        const userPayload = {
            id: 'uuid',
            email: 'test@test.com',
        } as IUserPayload;
        const expireOpt = {
            atk_expire: '1h',
            rtk_expire: '1d',
        } as IExpireOpt;

        const tokens = await service.generateTokens(userPayload, expireOpt);

        expect(tokens.atk).toBeDefined();
        expect(tokens.rtk).toBeDefined();
        expect(memory[userPayload.id]).toBe(tokens.rtk);

        const isValidate = await service.validateRtk(
            userPayload.id,
            tokens.rtk,
        );
        expect(isValidate).toBeTruthy();
    });

    it('deletes stored token', () => {
        expect(memory['uuid']).toBeDefined();
        service.delete('uuid');
        expect(memory['uuid']).toBeUndefined();
    });
});
