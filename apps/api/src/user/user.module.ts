import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { AuthService } from '../auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './entities/user.repository';
import { UtilModule } from '@libs/util';
import { User } from './entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User]), UtilModule],
    controllers: [UserController],
    providers: [UserService, AuthService, UserRepository],
})
export class UserModule {}
