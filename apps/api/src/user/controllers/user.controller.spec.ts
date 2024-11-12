import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../services/user.service';
import { UserController } from './user.controller';
import { CreateUserDto, SignInDto } from '@libs/dto';
import { User } from '../entities/user.entity';
import { IUserPayload } from '@libs/util/jwt';
import { ApiAuthGuard } from '@libs/common';

describe('UserController', () => {
    let controller: UserController;
    let fakeAuthService: Partial<AuthService>;
    let fakeUserService: Partial<UserService>;
    let fakeApiAuthGuard: Partial<ApiAuthGuard>;

    beforeEach(async () => {
        const users: User[] = [];

        fakeAuthService = {
            signup: (createUserDto: CreateUserDto) => {
                users.push({
                    id: createUserDto.email + '-' + createUserDto.username,
                    ...createUserDto,
                } as User);
                return Promise.resolve({
                    atk: `${createUserDto.email}.access-token`,
                    rtk: `${createUserDto.email}.refresh-token`,
                });
            },
            signin: (signInDto: SignInDto) => {
                return Promise.resolve({
                    atk: `${signInDto.email}.access-token`,
                    rtk: `${signInDto.email}.refresh-token`,
                });
            },
        };

        fakeUserService = {
            findOne: (userId: string) => {
                const user = users.filter((user) => user.id === userId)[0];
                return Promise.resolve(user);
            },
        };

        fakeApiAuthGuard = {
            canActivate: jest.fn(() => true),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                { provide: AuthService, useValue: fakeAuthService },
                { provide: UserService, useValue: fakeUserService },
            ],
        })
            .overrideGuard(ApiAuthGuard)
            .useValue(fakeApiAuthGuard)
            .compile();

        controller = module.get(UserController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('signs up user and return tokens', async () => {
        const tokens = await controller.signUp({
            email: 'test@test.com',
            password: 'mypassword',
            username: 'test-user',
        });

        expect(tokens.atk).toBeDefined();
        expect(tokens.rtk).toBeDefined();
    });

    it('signs in user and return tokens', async () => {
        const tokens = await controller.signIn({
            email: 'test@test.com',
            password: 'mypassword',
        });

        expect(tokens.atk).toBeDefined();
        expect(tokens.rtk).toBeDefined();
    });

    it('finds me', async () => {
        const createUserDto = {
            email: 'test@test.com',
            password: 'mypassword',
            username: 'test-user',
        };

        await controller.signUp(createUserDto);
        const me = await controller.me({
            id: createUserDto.email + '-' + createUserDto.username,
        } as IUserPayload);

        expect(me).toBeDefined();
    });
});
