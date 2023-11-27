import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../entities/user.repository';

@Injectable()
export class UserService {
    constructor(private readonly userRepo: UserRepository) {}

    async findOne(userId: string) {
        try {
            const user = await this.userRepo.findOne(userId);
            if (!user) throw new Error('NOT_FOUND');
            return user;
        } catch (error) {
            if (error.message === 'NOT_FOUND')
                throw new NotFoundException('User not found');
            throw new BadRequestException(error.message);
        }
    }
}
