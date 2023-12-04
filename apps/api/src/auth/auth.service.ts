import { CreateUserDto } from '@libs/dto/user/create-user.dto';
import { UserRepository } from '../user/entities/user.repository';
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@libs/util/jwt';
import { SignInDto } from '@libs/dto/user/sign-in.dto';
import { CryptoService } from '@libs/util/crypto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly cryptoService: CryptoService,
        private readonly jwtService: JwtService,
    ) {}

    async signup(createUserDto: CreateUserDto) {
        try {
            const users = await this.userRepo.findByEmail(createUserDto.email);
            if (users.length) {
                throw new Error('Email in use');
            }

            createUserDto.password = await this.cryptoService.hash(
                createUserDto.password,
            );
            const newUser = await this.userRepo.create(createUserDto);
            const tokens = await this.jwtService.generateTokens(newUser, {
                atk_expire: '1h',
                rtk_expire: '1d',
            });

            return tokens;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async signin(signInDto: SignInDto) {
        try {
            const user = await this.validateUser(
                signInDto.email,
                signInDto.password,
            );
            const tokens = await this.jwtService.generateTokens(user, {
                atk_expire: '1h',
                rtk_expire: '1d',
            });

            return tokens;
        } catch (error) {
            if (error.message === 'NOT_FOUND')
                throw new NotFoundException('User not found');
            throw new BadRequestException(error.message);
        }
    }

    private async validateUser(email: string, password: string) {
        const storedUser = await this.userRepo.findOneByEmail(email);
        if (!storedUser) throw new Error('NOT_FOUND');

        await this.validatePassword(password, storedUser.password);
        return storedUser;
    }

    private async validatePassword(plain: string, hashed: string) {
        const match = await this.cryptoService.compare(plain, hashed);
        if (!match) throw new Error('Invalid password');
    }
}