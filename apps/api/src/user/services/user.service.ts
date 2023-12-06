import { Injectable } from '@nestjs/common';
import { UserRepository } from '../entities/user.repository';
import { UserNotFoundException } from '@libs/common';

@Injectable()
export class UserService {
    constructor(private readonly userRepo: UserRepository) {}

    async findOne(userId: string) {
        const user = await this.userRepo.findOne(userId);
        if (!user) throw new UserNotFoundException();
        return user;
    }
}
