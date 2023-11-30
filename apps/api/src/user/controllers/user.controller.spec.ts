import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../services/user.service';
import { UserController } from './user.controller';
import { CreateUserDto, SignInDto } from '@libs/dto';
import { User } from '../entities/user.entity';
import { IUserPayload, JwtService } from '@libs/util/jwt';

describe('UserController', () => {
    let controller: UserController;
    let fakeAuthService: Partial<AuthService>;
    let fakeUserService: Partial<UserService>;
    let fakeJwtService: Partial<JwtService>;

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

        fakeJwtService = {
            verify: (token: string) => {
                return { id: token } as IUserPayload;
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                { provide: AuthService, useValue: fakeAuthService },
                { provide: UserService, useValue: fakeUserService },
                { provide: JwtService, useValue: fakeJwtService },
            ],
        }).compile();

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
