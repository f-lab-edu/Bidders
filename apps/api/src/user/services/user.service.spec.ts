import { Test } from '@nestjs/testing';
import { UserRepository } from '../entities/user.repository';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';

describe('UserService', () => {
    let service: UserService;
    let fakeUserRepo: Partial<UserRepository>;

    beforeEach(async () => {
        fakeUserRepo = {
            findOne: (id: string) => {
                return Promise.resolve({ id } as User);
            },
        };

        const module = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: UserRepository, useValue: fakeUserRepo },
            ],
        }).compile();

        service = module.get(UserService);
    });

    it('finds user with an user id', async () => {
        const user = await service.findOne('qwer-adsf-zxcv');
        expect(user).toBeDefined();
    });
});
