import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '@libs/dto/user/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User) private readonly repo: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const user = this.repo.create(createUserDto);
        return await this.repo.save(user);
    }

    async findByEmail(email: string) {
        const users = await this.repo.find({ where: { email } });
        return users;
    }

    async findOneByEmail(email: string) {
        const user = await this.repo.findOneBy({ email });
        return user;
    }

    async findOne(id: string) {
        const user = await this.repo.findOne({ where: { id } });
        return user;
    }
}
